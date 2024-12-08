import { Contour } from '../types';
import { svgPathToContour } from '../svg-helpers/svg-path-to-contour.ts';
import { SVGPathData } from 'svg-pathdata';

export interface GlyphParams {
  name: string;
  width: number;
  height: number;
  codes: number[];
  d: string;
}

export class Glyph {
  id: number;
  name: string;
  width: number;
  height: number;
  contours: Contour[];

  private static _lastId = 0;

  constructor(params: GlyphParams) {
    this.id = Glyph._lastId++;
    this.name = params.name;
    this.width = params.width;
    this.height = params.height;

    const size = Math.max(this.width, this.height);
    const accuracy = (size > 500) ? 0.3 : size * 0.0006;

    this.contours = svgPathToContour(new SVGPathData(params.d), accuracy);
  }
}