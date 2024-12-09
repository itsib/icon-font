import { Transform, TransformCallback } from 'node:stream';
import sax from 'sax';
import { BufferWithMeta, FileMetadata, SymbolMeta } from '../../types/types.ts';
import { SVGCommand, SVGPathData, SVGPathDataParser, SVGPathDataTransformer } from 'svg-pathdata';
import { START_UNICODE, SYMBOL_SIZE } from '../../utils/constants.ts';
import { Buffer } from 'node:buffer';
import { populateMetadata } from '../../utils/populate-metadata.ts';
import { svgRectToPath } from '../../svg-helpers/svg-rect-to-path.ts';
import { svgLineToPath } from '../../svg-helpers/svg-line-to-path.ts';
import { svgCircleToPath } from '../../svg-helpers/svg-circle-to-path.ts';
import type { SvgTransformation } from '../../types';
import { round } from '../../utils/round.ts';

export class TransformPrepareIcons extends Transform {

  _size = SYMBOL_SIZE;

  _startUnicode = START_UNICODE;

  constructor() {
    super({ objectMode: true });
  }

  private _sizeAndPos(pathData: SVGPathData): { x: number; y: number, width: number; height: number } {
    const { minX, maxX, minY, maxY } = pathData.getBounds();
    const width = maxX - minX;
    const height = maxY - minY;

    return {
      x: minX,
      y: minY,
      width: width,
      height: height,
    }
  }

  private _adjustSize(pathData: SVGPathData): SVGPathData {
    const { width, height } = this._sizeAndPos(pathData);
    const currentSize = Math.round(Math.max(width, height));

    // If the shape fits into a given square, we do nothing
    if (currentSize !== this._size) {
      pathData = pathData.scale(this._size / currentSize);
    }
    return pathData;
  }

  private _adjustAlign(pathData: SVGPathData): SVGPathData {
    const { x, y, width, height } = this._sizeAndPos(pathData);

    const dX = x - (this._size - width) / 2;
    const dY = y - (this._size - height) / 2;

    return pathData.translate(-dX, -dY);
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

      if (width !== this._size || height !== this._size) {
        output.push({
          attribute: `scale(${this._size / width}, ${this._size / height})`,
          function: SVGPathDataTransformer.SCALE(this._size / width, this._size / height),
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

      for (let i = 0; i < paths.length; i++) {
        parser.parse(paths[i], commands);
      }
      parser.finish(commands);

      let svgPathData = new SVGPathData(commands);
      svgPathData = this._adjustSize(svgPathData);
      svgPathData = this._adjustAlign(svgPathData);

      const path = svgPathData.round(100).scale(1, -1).encode();

      const meta: SymbolMeta = {
        index: chunk.metadata.index,
        name: chunk.metadata.name,
        codepoint: this._startUnicode + chunk.metadata.index,
        x: 0,
        y: 0,
        width: this._size,
        height: this._size,
      }

      callback(null, populateMetadata(Buffer.from(path), meta));
    }

    const svg = chunk.toString('utf8');
    parser.write(svg);
    parser.end();
  }
}