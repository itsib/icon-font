import { Transform, TransformCallback } from 'node:stream';
import type { SVGCommand } from 'svg-pathdata';
import { SVGPathDataTransformer, SVGPathData, SVGPathDataParser } from 'svg-pathdata';
import { Buffer } from 'node:buffer';
import sax from 'sax';
import { BufferWithMeta, FileMetadata, IconTune, SymbolMetadata } from '../../types';
import { populateMetadata } from '../../utils/populate-metadata.ts';
import { svgRectToPath } from '../../svg-helpers/svg-rect-to-path.ts';
import { svgLineToPath } from '../../svg-helpers/svg-line-to-path.ts';
import { svgCircleToPath } from '../../svg-helpers/svg-circle-to-path.ts';
import type { SvgTransformation } from '../../types';

export class TransformPrepareIcons extends Transform {
  /**
   * Symbol glyph size
   * @default 480
   */
  _shapeSize: number;
  /**
   * The displayed area
   * @default 512
   */
  _symbolBoxSize: number;

  _startUnicode: number;

  _currentUnicode: number;

  _bookedCodes: Set<number>;

  _iconsOptions: { [name: string]: IconTune };

  _disableAutoalign: boolean

  constructor(iconsOptions?: { [name: string]: IconTune }, shapeSizeAdjust = 0.9375, startUnicode = 0xea01, disableAutoalign = false) {
    super({ objectMode: true });

    this._iconsOptions = iconsOptions || {};
    this._startUnicode = startUnicode
    this._currentUnicode = startUnicode
    this._symbolBoxSize = 2048
    this._disableAutoalign = disableAutoalign
    this._shapeSize = Math.floor(this._symbolBoxSize * shapeSizeAdjust)
    this._bookedCodes = new Set();

    const keys = Object.keys(this._iconsOptions);
    for (let i = 0; i < keys.length; i++) {
      const option = this._iconsOptions[keys[i]];
      if (option && option.code) {
        if (this._bookedCodes.has(option.code)) {
          throw new Error(`This unicode ${option.code} is already in use`);
        }

        this._bookedCodes.add(option.code)
      }
    }
  }

  private _sizeAndPos(pathData: SVGPathData): { x: number; y: number, width: number; height: number } {
    const { minX, maxX, minY, maxY } = pathData.getBounds();
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  private _adjustSize(pathData: SVGPathData, tunes?: IconTune): SVGPathData {
    const { width, height } = this._sizeAndPos(pathData);
    const currentSize = Math.round(tunes?.size === 'cover' ? Math.min(width, height) : Math.max(width, height));

    // If the shape fits into a given square, we do nothing
    if (currentSize !== this._shapeSize) {
      pathData = pathData.scale(this._shapeSize / currentSize);
    }

    // Tune icon size
    if (typeof tunes?.size === 'number') {
      pathData = pathData.scale(tunes.size);
    }

    return pathData;
  }

  private _adjustAlign(pathData: SVGPathData, tunes?: IconTune): SVGPathData {
    const { x, y, width, height } = this._sizeAndPos(pathData);

    let dX = x - (this._symbolBoxSize - width) / 2;
    let dY = y - (this._symbolBoxSize - height) / 2;

    if (tunes?.x != null) {
      dX = dX - (this._symbolBoxSize * tunes.x);
    }

    if (tunes?.y != null) {
      dY = dY - (this._symbolBoxSize * tunes.y);
    }

    return  pathData.translate(-dX, -dY);
  }

  private _parseTransformAttr(transform?: string): SvgTransformation[] {
    if (!transform) return [];

    const output: SvgTransformation[] = [];

    const transformations = transform.match(/(rotate|translate|scale|skewX|skewY|matrix)\s*\(([^)]*)\)\s*/g) || [];
    for (let i = 0; i < transformations.length; i++) {
      const transformation = transformations[i];
      const matched = transformation.match(/[\w.-]+/g);
      if (!matched) continue;

      const [transformType, ...data] = matched;
      switch (transformType) {
        case 'rotate': {
          const a = parseFloat(data[0]);
          const x = data[1] ? parseFloat(data[1]) : undefined;
          const y = data[2] ? parseFloat(data[2]) : undefined;
          output.push({
            attribute: transformation,
            function: SVGPathDataTransformer.ROTATE(a, x, y),
          });
          break;
        }
        case 'translate': {
          const x = parseFloat(data[0]);
          const y = data[1] ? parseFloat(data[1]) : undefined;
          output.push({
            attribute: transformation,
            function: SVGPathDataTransformer.TRANSLATE(x, y),
          });
          break;
        }
        case 'skewX': {
          const a = parseFloat(data[0]);
          output.push({
            attribute: transformation,
            function: SVGPathDataTransformer.SKEW_X(a),
          });
          break;
        }
        case 'skewY': {
          const a = parseFloat(data[0]);
          output.push({
            attribute: transformation,
            function: SVGPathDataTransformer.SKEW_Y(a),
          });
          break;
        }
        case 'matrix': {
          const rest = data.map(parseFloat) as [number, number, number, number, number, number];
          output.push({
            attribute: transformation,
            function: SVGPathDataTransformer.MATRIX(...rest),
          });
          break;
        }
      }
    }

    return output;
  }

  private _parseViewBoxAttr(viewBox?: string): SvgTransformation[] {
    if (!viewBox) return [];

    try {
      const values = viewBox.split(/\s*,*\s|\s,*\s*|,/);

      const dX = parseFloat(values[0]) || 0;
      const dY = parseFloat(values[1]) || 0;
      const width = parseFloat(values[2]);
      const height = parseFloat(values[3]);

      const output: SvgTransformation[] = [];

      if (dX !== 0 || dY !== 0) {
        output.push({
          attribute: `translate(${-dX}, ${-dY})`,
          function: SVGPathDataTransformer.TRANSLATE(-dX, -dY),
        });
      }

      if (width !== this._symbolBoxSize || height !== this._symbolBoxSize) {
        output.push({
          attribute: `scale(${this._symbolBoxSize / width}, ${this._symbolBoxSize / height})`,
          function: SVGPathDataTransformer.SCALE(this._symbolBoxSize / width, this._symbolBoxSize / height),
        });
      }
      return output;
    } catch (error: any) {
      console.error(error);
      return [];
    }
  }

  _transform(chunk: BufferWithMeta<FileMetadata>, _encoding: any, callback: TransformCallback) {
    const parser = sax.parser(true);
    const parents: (sax.Tag | sax.QualifiedTag)[] = [];
    const transforms: SvgTransformation[][] = [];
    const paths: string[] = [];

    function pushTransform(_newTransformations: SvgTransformation[]) {
      const index = parents.length - 1;
      transforms[index] = [...(transforms[index] || []), ..._newTransformations];
    }

    function applyTransformAndPush(path: string) {
      const svgPathData = new SVGPathData(path).toAbs();

      const transformations = transforms.flat(2);
      for (let i = 0; i < transformations.length; i++) {
        const transformation = transformations[i];
        svgPathData.transform(transformation.function);
      }

      paths.push(svgPathData.encode());
    }

    parser.onerror = (error: Error) => {
      callback(error);
    }

    parser.onopentag = (tag: sax.Tag | sax.QualifiedTag) => {
      parents.push(tag);

      pushTransform(this._parseTransformAttr(tag.attributes.transform as string));

      switch (tag.name) {
        case 'svg':
          pushTransform(this._parseViewBoxAttr(tag.attributes.viewBox as string));
          break;
        case 'path':
          applyTransformAndPush(tag.attributes.d as string);
          break;
        case 'rect':
          applyTransformAndPush(svgRectToPath(tag.attributes));
          break;
        case 'line':
          applyTransformAndPush(svgLineToPath(tag.attributes));
          break;
        case 'polyline':
        case 'polygon':
          applyTransformAndPush(`M${tag.attributes.points}`);
          break;
        case 'circle':
        case 'ellipse':
          applyTransformAndPush(svgCircleToPath(tag.attributes));
          break;
        case 'g':
          break;
        default:
          console.warn(`Unsupported tag ${tag.name}`);
      }
    }

    parser.onclosetag = () => {
      parents.pop();
      transforms.pop();
    }

    parser.onend = () => {
      const commands: SVGCommand[] = [];
      const parser = new SVGPathDataParser();
      const tunes: IconTune | undefined = this._iconsOptions[chunk.metadata.name];

      for (let i = 0; i < paths.length; i++) {
        try {
          parser.parse(paths[i], commands);
        } catch (e) {
          console.error(chunk.metadata.name, e);
        }
      }
      parser.finish(commands);

      let svgPathData = new SVGPathData(commands);
      svgPathData = this._adjustSize(svgPathData, tunes);
      svgPathData = svgPathData.scale(1, -1);
      if (!this._disableAutoalign) {
        svgPathData = this._adjustAlign(svgPathData, tunes);
      }
      const { x, y, width, height } = this._sizeAndPos(svgPathData);

      const path = svgPathData.toAbs().aToC().normalizeST().round(100).encode();

      let codepoint: number
      if (tunes && tunes.code) {
        codepoint = tunes.code;
      } else {
        while (this._bookedCodes.has(this._currentUnicode)) {
          this._currentUnicode++
        }
        codepoint = this._currentUnicode;
      }



      const meta: SymbolMetadata = {
        index: chunk.metadata.index,
        name: chunk.metadata.name,
        codepoint,
        x: x,
        y: y,
        width: width,
        height: height,
        boxSize: this._symbolBoxSize,
      }

      this._currentUnicode++

      callback(null, populateMetadata(Buffer.from(path), meta));
    }

    const svg = chunk.toString('utf8');
    parser.write(svg);
    parser.end();
  }
}