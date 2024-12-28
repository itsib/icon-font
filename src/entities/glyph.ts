import { Contour, ContourPoint } from '../types';
import { svgPathToContour } from '../svg-helpers/svg-path-to-contour.ts';
import { SVGPathData } from 'svg-pathdata';

export interface GlyphConstructorArgs {
  id: number;
  name: string;
  path: string;
  codepoint: number;
  boxSize: number;
}

export class Glyph {
  id: number;
  name: string;
  contours: Contour[];
  codepoint: number;
  x: number;
  y: number;
  height: number;
  width: number;
  flags: number[];
  allX: number[];
  allY: number[];
  sizeBytes: number;

  constructor(args: GlyphConstructorArgs) {
    this.id = args.id;
    this.name = args.name;

    this.codepoint = args.codepoint;
    this.x = 0;
    this.y = 0;
    this.width = args.boxSize;
    this.height = args.boxSize;

    this.flags = [];
    this.allX = [];
    this.allY = [];

    if (!args.path) {
      this.contours = [];
      this.sizeBytes = 0;
      return;
    }

    const pathData = new SVGPathData(args.path);
    this.contours = svgPathToContour(pathData, 0.2);
    this.sizeBytes = 12 + (this.contours.length * 2); // glyph fixed properties

    this._prepareFields();
  }

  get xMin(): number {
    return this.x;
  }

  get xMax(): number {
    return this.x + this.width;
  }

  get yMin(): number {
    return this.y;
  }

  get yMax(): number {
    return this.y + this.height;
  }

  private _prepareFields() {
    for (let i = 0; i < this.contours.length; i++) {
      const contour = this.contours[i];

      for (let j = 0; j < contour.points.length; j++) {
        const point = contour.points[j];

        const flag = this._pointToFlag(point);
        this.flags.push(flag);

        // Collect all x points
        if (point.x !== 0) {
          this.allX.push(point.x);

          // add 1 or 2 bytes for each coordinate depends on its size
          this.sizeBytes += (-0xFF <= point.x && point.x <= 0xFF) ? 1 : 2;
        }
        if (point.y !== 0) {
          this.allY.push(point.y);

          // add 1 or 2 bytes for each coordinate depends on its size
          this.sizeBytes += (-0xFF <= point.y && point.y <= 0xFF) ? 1 : 2;
        }
      }
    }

    this._simplifyFlags();

    this.sizeBytes += this.flags.length;

    if (this.sizeBytes % 4 !== 0) { // glyph size must be divisible by 4.
      this.sizeBytes += 4 - this.sizeBytes % 4;
    }
  }

  private _simplifyFlags() {
    const result: number[] = [];
    let prevFlag = -1;
    let firstRepeat = false;

    for (let i = 0; i < this.flags.length; i++) {
      const flag = this.flags[i];
      if (prevFlag === flag) {
        if (firstRepeat) {
          result[result.length - 1] += 8; // current flag repeats previous one, need to set 3rd bit of previous flag and set 1 to the current one
          result.push(1);
          firstRepeat = false;
        } else {
          result[result.length - 1]++; // when flag is repeating second or more times, we need to increase the last flag value
        }
      } else {
        firstRepeat = true;
        prevFlag = flag;
        result.push(flag);
      }
    }

    this.flags = result;
  }

  private _pointToFlag(point: ContourPoint): number {
    let flag = point.onCurve ? 1 : 0;

    // Compute flags
    if (point.x === 0) {
      flag += 16;
    } else {
      if (-0xFF <= point.x && point.x <= 0xFF) {
        flag += 2; // the corresponding x-coordinate is 1 byte long
      }
      if (point.x > 0 && point.x <= 0xFF) {
        flag += 16; // If x-Short Vector is set, this bit describes the sign of the value, with 1 equalling positive and 0 negative
      }
    }
    if (point.y === 0) {
      flag += 32;
    } else {
      if (-0xFF <= point.y && point.y <= 0xFF) {
        flag += 4; // the corresponding y-coordinate is 1 byte long
      }
      if (point.y > 0 && point.y <= 0xFF) {
        flag += 32; // If y-Short Vector is set, this bit describes the sign of the value, with 1 equalling positive and 0 negative.
      }
    }
    return flag;
  }
}
