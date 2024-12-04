import { Writable } from 'node:stream';
import sax from 'sax';
import { SVGCommand, SVGPathData, SVGPathDataParser } from 'svg-pathdata';
import { IconInfo, SvgTransformation } from '../types.ts';
import {
  svgAlignShapeCenter,
  svgCircleToPath,
  svgLineToPath,
  svgNormaliseShapeSize,
  svgParseAttributeTransform,
  svgPolylineToPath,
  svgRectToPath,
  svgViewBoxToTransform
} from './svg-utils.ts';

export interface SvgIconConfig extends IconInfo {
  canvasSize: number;
  shapeMaxSize: number;
}

export class SvgIconTransformStream extends sax.SAXStream {
  private readonly _config: SvgIconConfig;

  private readonly _paths: string[] = [];

  private readonly _parents: (sax.Tag | sax.QualifiedTag)[] = [];

  private readonly _transforms: SvgTransformation[][] = [];

  private _destination?: Writable;

  constructor(config: SvgIconConfig) {
    super(true);

    this._config = config;
    this.on('opentag', tag => this._onOpentag(tag));
    this.on('closetag', () => this._onClosetag());
    this.on('end', () => this._onEnd());
  }

  destination(writable: Writable) {
    this._destination = writable;
  }

  private _onOpentag(tag: sax.Tag | sax.QualifiedTag): void {
    this._parents.push(tag);

    this._pushTransform(svgParseAttributeTransform(tag.attributes));

    switch (tag.name) {
      case 'svg':
        this._pushTransform(svgViewBoxToTransform(this._config.canvasSize, tag.attributes));
        break;
      case 'path':
        this._applyTransformAndPush(tag.attributes.d as string);
        break;
      case 'rect':
        this._applyTransformAndPush(svgRectToPath(tag.attributes));
        break;
      case 'line':
        this._applyTransformAndPush(svgLineToPath(tag.attributes));
        break;
      case 'polyline':
        this._applyTransformAndPush(svgPolylineToPath(tag.attributes));
        break;
      case 'polygon':
        this._applyTransformAndPush(svgPolylineToPath(tag.attributes));
        break;
      case 'circle':
      case 'ellipse':
        this._applyTransformAndPush(svgCircleToPath(tag.attributes));
        break;
      case 'g':
        break;
      default:
        console.warn(`Unsupported tag ${tag.name} in ${this._config.name}`);
    }
  }

  private _onClosetag(): void {
    this._parents.pop();
    this._transforms.pop();
  }

  private _onEnd(): void {
    if (!this._destination) return;

    const commands: SVGCommand[] = [];
    const parser = new SVGPathDataParser();

    for (let i = 0; i < this._paths.length; i++) {
      parser.parse(this._paths[i], commands);
    }
    parser.finish(commands);

    let svgPathData = new SVGPathData(commands);
    svgPathData = svgNormaliseShapeSize(svgPathData, this._config.shapeMaxSize);
    svgPathData = svgAlignShapeCenter(svgPathData, this._config.canvasSize, this._config.shapeMaxSize);

    const path = svgPathData.round(100).encode();
    const viewBox = `0 0 ${this._config.canvasSize} ${this._config.canvasSize}`;

    this._destination.write(`<svg version="1.1" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">\n`);
    this._destination.write(`  <path d="${path}" />\n`);
    this._destination.write('</svg>\n');
    this._destination.end();
  }

  private _pushTransform(transforms: SvgTransformation[]): void {
    const index = this._parents.length - 1;
    this._transforms[index] = [...(this._transforms[index] || []), ...transforms];
  }

  private _applyTransformAndPush(path: string): void {
    const svgPathData = new SVGPathData(path).toAbs();

    const transformations = this._transforms.flat(2);
    for (let i = 0; i < transformations.length; i++) {
      const transformation = transformations[i];
      svgPathData.transform(transformation.function);
    }

    this._paths.push(svgPathData.encode());
  }
}