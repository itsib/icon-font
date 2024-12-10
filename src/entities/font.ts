import { Glyph } from './glyph.ts';
import { slugify } from '../utils/slugify.ts';
import { toUCS2Bytes, toUTF8Bytes } from '../utils/string-to-bytes.ts';

export interface SfntName {
  id: number;
  value: string;
}

export enum NameTableId {
  Copyright = 0,
  FontFamily = 1,
  FontSubFamily = 2,
  ID = 3,
  Slug = 4,
  Version = 5,
  ShortName = 6,
  Description = 10,
  URLVendor = 11
}

export interface NameTableItem {
  /**
   * Data id
   */
  id: NameTableId;
  /**
   * Data in bytes
   */
  data: Uint8Array;
  /**
   * platformID, encodingID, languageID
   */
  flags: [number, number, number];
}

export interface FontConstructorArgs {
  fontFamily: string;
  fontSubFamily: string;
  metadata?: string;
  description?: string;
  url?: string;
  size: number;
  glyphTotalSize: number;
  glyphs: Glyph[];
  codePoints: { [key: number]: Glyph };
}

export class Font {
  id: string;
  fontFamily: string;
  fontSubFamily: string;
  copyright: string;
  description: string;
  url: string;

  width: number;
  height: number;
  unitsPerEm: number;
  ascent: number;
  descent: number;
  weight: number;
  widthClass: number;

  glyphs: Glyph[];
  codePoints: { [key: number]: Glyph };
  glyphTotalSize: number;

  sfntNames: SfntName[] = [];

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

  constructor(args: FontConstructorArgs) {
    this.id = slugify(args.fontFamily);
    this.fontFamily = args.fontFamily;
    this.fontSubFamily = args.fontSubFamily;
    this.copyright = args.metadata ?? '';
    this.description = args.description ?? '';
    this.url = args.url ?? '';

    this.width = args.size;
    this.height = args.size;
    this.unitsPerEm = args.size;
    this.ascent = -args.size;
    this.descent = 0;
    this.weight = 400;
    this.widthClass = 5; // Medium (normal)

    this.glyphs = args.glyphs;
    this.codePoints = args.codePoints;
    this.glyphTotalSize = args.glyphTotalSize;
  }

  getNames(): { size: number, names: NameTableItem[] } {
    const names: NameTableItem[] = [];
    let size = 0;

    const add = (id: NameTableId, value: string) => {
      names.push(
        { id: id, data: toUTF8Bytes(value), flags: [1, 0, 0] },
        { id: id, data: toUCS2Bytes(value), flags: [3, 1, 0x409] },
      );
      size += names[names.length - 2].data.length + 12;
      size += names[names.length - 1].data.length + 12;
    }

    if (this.copyright) {
      add(NameTableId.Copyright, this.copyright);
    }
    if (this.description) {
      add(NameTableId.Description, this.description);
    }
    if (this.url) {
      add(NameTableId.URLVendor, this.url);
    }
    add(NameTableId.ID, this.id);
    add(NameTableId.FontFamily, this.fontFamily);
    add(NameTableId.FontSubFamily, this.fontSubFamily);
    add(NameTableId.Slug, this.id);
    add(NameTableId.Version, 'Version 1.0');
    add(NameTableId.ShortName, this.id);

    return { size, names };
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