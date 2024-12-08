import { slugify } from '../../utils/slugify.ts';
import { Contour, ContourPoint } from '../../types';

export interface Ligature {
  ligature: string;
  unicode: number[];
  glyph: Glyph;
}

export interface Panose {
  familyType: number;
  serifStyle: number;
  weight: number;
  proportion: number;
  contrast: number;
  strokeVariation: number;
  armStyle: number;
  letterform: number;
  midline: number;
  xHeight: number;
}

export interface LigatureGroup {
  codePoint: number;
  ligatures: Ligature[];
  startGlyph: Glyph;
}

export interface SfntName {
  id: number;
  value: string;
}

export class Font {
  id: string = '';
  description: string = '';
  url: string = '';
  ascent: number = 850;
  copyright: string = '';
  createdDate: Date = new Date();
  glyphs: Glyph[] = [];
  missingGlyph?: {
    d?: string;
    width?: number;
    height?: number;
  }
  ligatures: Ligature[] = [];
  codePoints: { [key: number]: Glyph } = {};
  isFixedPitch: number = 0;
  italicAngle: number = 0;
  familyClass: number = 0; // No Classification
  familyName: string = '';
  subfamilyName: string = '';
  fsSelection: number = 0x40 | 0x80;
  fsType: number = 0;
  lowestRecPPEM: number = 8;
  macStyle: number = 0;
  modifiedDate: Date = new Date();
  panose: Panose = {
    familyType: 2,
    serifStyle: 0,
    weight: 5,
    proportion: 3,
    contrast: 0,
    strokeVariation: 0,
    armStyle: 0,
    letterform: 0,
    midline: 0,
    xHeight: 0,
  };
  revision: number = 1;
  sfntNames: SfntName[] = [];
  stretch: string = 'normal';
  metadata?: string;
  underlineThickness: number = 0;
  unitsPerEm: number = 1000;
  weightClass: number | string = 400; // normal
  width: number = 1000;
  widthClass: number = 5; // Medium (normal)
  ySubscriptXOffset: number = 0;
  ySuperscriptXOffset: number = 0;
  horizOriginX: number = 0;
  horizOriginY: number = 0;
  vertOriginX: number = 0;
  vertOriginY: number = 0;
  int_descent: number = -150;
  xHeight: number = 0;
  height: number = 0;
  capHeight: number = 0;
  ttf_glyph_size: number = 0;

  private int_ySubscriptXSize?: number;
  private int_ySubscriptYSize?: number;
  private int_ySubscriptYOffset?: number;
  private int_ySuperscriptXSize?: number;
  private int_ySuperscriptYSize?: number;
  private int_ySuperscriptYOffset?: number;
  private int_yStrikeoutSize?: number;
  private int_yStrikeoutPosition?: number;
  private int_lineGap?: number;
  private int_underlinePosition?: number;

  get descent(): number {
    return this.int_descent;
  }

  set descent(value: number) {
    this.int_descent = parseInt(Math.round(-Math.abs(value)).toString(), 10);
  }

  get avgCharWidth(): number {
    if (this.glyphs.length === 0) {
      return 0;
    }

    const fullWith = this.glyphs.reduce<number>((acc, cur) => acc + cur.width, 0);
    const advWidth = fullWith / this.glyphs.length;

    return parseInt(advWidth.toString(), 10);
  }

  get ySubscriptXSize(): number {
    return parseInt((this.int_ySubscriptXSize !== undefined ? this.int_ySubscriptXSize : (this.width * 0.6347)).toString(), 10);
  }

  set ySubscriptXSize(value: number) {
    this.int_ySubscriptXSize = value;
  }

  get ySubscriptYSize(): number {
    return parseInt((this.int_ySubscriptYSize !== undefined ? this.int_ySubscriptYSize : ((this.ascent - this.descent) * 0.7)).toString(), 10);
  }

  set ySubscriptYSize(value: number) {
    this.int_ySubscriptYSize = value;
  }

  get ySubscriptYOffset(): number {
    return parseInt((this.int_ySubscriptYOffset !== undefined ? this.int_ySubscriptYOffset : ((this.ascent - this.descent) * 0.14)).toString(), 10);
  }

  set ySubscriptYOffset(value: number) {
    this.int_ySubscriptYOffset = value;
  }

  get ySuperscriptXSize(): number {
    return parseInt((this.int_ySuperscriptXSize !== undefined ? this.int_ySuperscriptXSize : (this.width * 0.6347)).toString(), 10);
  }

  set ySuperscriptXSize(value: number) {
    this.int_ySuperscriptXSize = value;
  }

  get ySuperscriptYSize(): number {
    return parseInt((this.int_ySuperscriptYSize !== undefined ? this.int_ySuperscriptYSize : ((this.ascent - this.descent) * 0.7)).toString(), 10);
  }

  set ySuperscriptYSize(value: number) {
    this.int_ySuperscriptYSize = value;
  }

  get ySuperscriptYOffset(): number {
    return parseInt((this.int_ySuperscriptYOffset !== undefined ? this.int_ySuperscriptYOffset : ((this.ascent - this.descent) * 0.48)).toString(), 10);
  }

  set ySuperscriptYOffset(value: number) {
    this.int_ySuperscriptYOffset = value;
  }

  get yStrikeoutSize(): number {
    return parseInt((this.int_yStrikeoutSize !== undefined ? this.int_yStrikeoutSize : ((this.ascent - this.descent) * 0.049)).toString(), 10);
  }

  set yStrikeoutSize(value: number) {
    this.int_yStrikeoutSize = value;
  }

  get yStrikeoutPosition(): number {
    return parseInt((this.int_yStrikeoutPosition !== undefined ? this.int_yStrikeoutPosition : ((this.ascent - this.descent) * 0.258)).toString(), 10);
  }

  set yStrikeoutPosition(value: number) {
    this.int_yStrikeoutPosition = value;
  }

  get minLsb(): number {
    const minValue = Math.min(...this.glyphs.map(g => g.xMin));
    return parseInt(minValue.toString(), 10);
  }

  get minRsb(): number {
    if (!this.glyphs.length) {
      return parseInt(this.width.toString(), 10);
    }

    const value = this.glyphs.reduce((minRsb, glyph) => Math.min(minRsb, glyph.width - glyph.xMax), 0)

    return parseInt(value.toString(), 10);
  }

  get xMin(): number {
    if (!this.glyphs.length) {
      return this.width;
    }
    return this.glyphs.reduce((xMin, glyph) => Math.min(xMin, glyph.xMin), 0);
  }

  get yMin(): number {
    if (!this.glyphs.length) {
      // noinspection JSSuspiciousNameCombination
      return this.width;
    }
    return this.glyphs.reduce((yMin, glyph) => Math.min(yMin, glyph.yMin), 0);
  }

  get xMax(): number {
    if (!this.glyphs.length) {
      return this.width;
    }
    return this.glyphs.reduce((xMax, glyph) => Math.max(xMax, glyph.xMax), 0);
  }

  get yMax(): number {
    if (!this.glyphs.length) {
      // noinspection JSSuspiciousNameCombination
      return this.width;
    }
    return this.glyphs.reduce((yMax, glyph) => Math.max(yMax, glyph.yMax), 0);
  }

  get avgWidth(): number {
    const len = this.glyphs.length;
    if (len === 0) {
      return this.width;
    }
    const sumWidth = this.glyphs.reduce((sumWidth, glyph) => sumWidth + glyph.width, 0);
    return Math.round(sumWidth / len);
  }

  get maxWidth(): number {
    if (!this.glyphs.length) return this.width;
    return this.glyphs.reduce((maxWidth, glyph) => Math.max(maxWidth, glyph.width), 0);
  }

  get maxExtent(): number {
    if (!this.glyphs.length) {
      return this.width;
    }
    return this.glyphs.reduce((maxExtent, glyph) => Math.max(maxExtent, glyph.xMax), 0);
  }

  get lineGap(): number {
    return parseInt((this.int_lineGap !== undefined ? this.int_lineGap : ((this.ascent - this.descent) * 0.09)).toString(), 10);
  }

  set lineGap(value: number) {
    this.int_lineGap = value;
  }

  get underlinePosition(): number {
    return parseInt((this.int_underlinePosition !== undefined ? this.int_underlinePosition : ((this.ascent - this.descent) * 0.01)).toString(), 10);
  }

  set underlinePosition(value: number) {
    this.int_underlinePosition = value;
  }
}

export interface FontTTFConfig {
  fontName: string;
  metadata?: string;
}

export class FontTTF {
  id: string;
  familyName: string;
  copyright: string;
  description = 'The best icon font in the world';
  url = 'https://github.com/itsib';
  sfntNames: SfntName[];
  createdDate: Date
  modifiedDate: Date

  constructor(config: FontTTFConfig) {
    this.id = slugify(config.fontName);
    this.familyName = config.fontName;
    this.copyright = config.metadata || '';
    this.sfntNames = [
      { id: 2, value: 'Regular' },
      { id: 4, value: this.id },
      { id: 5, value: 'Version 1.0' },
      { id: 6, value: this.familyName },
    ];
    this.createdDate = new Date();
    this.modifiedDate = new Date();
  }
}

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






