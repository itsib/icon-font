import { Contour } from '../types';

export class Glyph {
  contours: Contour[] = [];
  d: string = '';
  id: number = 0;
  codes: any[] = [];
  unicode: number[] = [];
  ligatureCodes: number[] = [];
  character: string = '';
  ligature: string = '';
  height: number = 0;
  name: string = '';
  width: number = 0;
  canonical?: Glyph;
  ttf_x: number[] = [];
  ttf_y: number[] = [];
  ttf_flags: number[] = [];
  ttf_size: number = 0;

  get xMin(): number {
    let xMin = 0;
    let hasPoints = false;

    for (let i = 0; i < this.contours.length; i++) {
      const contour = this.contours[i];

      for (let j = 0; j < contour.points.length; j++) {
        const point = contour.points[j];
        xMin = Math.min(xMin, Math.floor(point.x));
        hasPoints = true;
      }
    }

    if (xMin < -32768) {
      throw new Error('xMin value for glyph ' + (this.name ? ('"' + this.name + '"') : JSON.stringify(this.codes)) +
        ' is out of bounds (actual ' + xMin + ', expected -32768..32767, d="' + this.d + '")');
    }
    return hasPoints ? xMin : 0;
  }

  get xMax(): number {
    let xMax = 0;
    let hasPoints = false;

    for (let i = 0; i < this.contours.length; i++) {
      const contour = this.contours[i];

      for (let j = 0; j < contour.points.length; j++) {
        const point = contour.points[j];
        xMax = Math.max(xMax, -Math.floor(-point.x));
        hasPoints = true;
      }
    }

    if (xMax > 32767) {
      throw new Error('xMax value for glyph ' + (this.name ? ('"' + this.name + '"') : JSON.stringify(this.codes)) +
        ' is out of bounds (actual ' + xMax + ', expected -32768..32767, d="' + this.d + '")');
    }
    return hasPoints ? xMax : this.width;
  }

  get yMin(): number {
    let yMin = 0;
    let hasPoints = false;

    for (let i = 0; i < this.contours.length; i++) {
      const contour = this.contours[i];

      for (let j = 0; j < contour.points.length; j++) {
        const point = contour.points[j];
        yMin = Math.min(yMin, Math.floor(point.y));
        hasPoints = true;
      }
    }

    if (yMin < -32768) {
      throw new Error('yMin value for glyph ' + (this.name ? ('"' + this.name + '"') : JSON.stringify(this.codes)) +
        ' is out of bounds (actual ' + yMin + ', expected -32768..32767, d="' + this.d + '")');
    }
    return hasPoints ? yMin : 0;
  }

  get yMax(): number {
    let yMax = 0;
    let hasPoints = false;

    for (let i = 0; i < this.contours.length; i++) {
      const contour = this.contours[i];

      for (let j = 0; j < contour.points.length; j++) {
        const point = contour.points[j];
        yMax = Math.max(yMax, -Math.floor(-point.y));
        hasPoints = true;
      }
    }

    if (yMax > 32767) {
      throw new Error('yMax value for glyph ' + (this.name ? ('"' + this.name + '"') : JSON.stringify(this.codes)) +
        ' is out of bounds (actual ' + yMax + ', expected -32768..32767, d="' + this.d + '")');
    }
    return hasPoints ? yMax : 0;
  }
}
