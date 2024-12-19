import { Glyph } from './glyph.ts';
import { slugify } from '../utils/slugify.ts';
import { toUCS2Bytes, toUTF8Bytes } from '../utils/string-to-bytes.ts';

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
  unitsPerEm: number;
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
  /**
   * Creation date.
   *
   * @description
   * 	Number of seconds since 12:00 midnight that
   * 	started January 1st, 1904, in GMT/UTC time zone.
   */
  created: number;

  width: number;
  height: number;
  /**
   * The number of font design units per em unit.
   *
   * @description
   *  Font files use their own coordinate system of font design units.
   *  A font design unit is the smallest measurable unit in the em
   *  square, an imaginary square that is used to size and align
   *  glyphs. The concept of em square is used as a reference
   *  scale factor when defining font size and device transformation
   *  semantics. The size of one em square is also commonly
   *  used to compute the paragraph indentation value.
   */
  unitsPerEm: number;
  /**
   * Distance from the top of character to the baseline.
   *
   * @description
   *  The ascent value of the font face in font design units.
   *  Ascent is the distance from the top of font character
   *  alignment box to the English baseline.
   */
  ascent: number;
  /**
   * Distance from the bottom of character to baseline.
   *
   * @description
   *  The descent value of the font face in font design units.
   *  Descent is the distance from the bottom of font character
   * alignment box to the English baseline.
   */
  descent: number;
  weight: number;
  widthClass: number;

  readonly glyphs: Glyph[];
  readonly codePoints: { [key: number]: Glyph };
  readonly glyphTotalSize: number;

  constructor(args: FontConstructorArgs) {
    this.id = slugify(args.fontFamily);
    this.fontFamily = args.fontFamily;
    this.fontSubFamily = args.fontSubFamily;
    this.copyright = args.metadata ?? '';
    this.description = args.description ?? '';
    this.url = args.url ?? '';
    this.created = Math.floor(Date.now() / 1000) + 2082844800;

    this.width = args.unitsPerEm;
    this.height = args.unitsPerEm;
    this.unitsPerEm = args.unitsPerEm;
    this.ascent = args.unitsPerEm; // Math.floor(args.unitsPerEm / 1.3333333333333333);
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

  getBounds(): Record<'minLsb' | 'minRsb' | 'xMin' | 'xMax' | 'yMin' | 'yMax' | 'maxWidth' | 'maxExtent' | 'avgWidth', number> {
    let minLsb = this.width;
    let minRsb = 0;
    let xMin = this.width;
    let xMax = 0;
    let yMin = this.height;
    let yMax = 0;
    let maxWidth = 0;
    let maxExtent = this.width;
    let totalWidth = 0;

    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];

      minLsb = minLsb < glyph.xMin ? minLsb : glyph.xMin;

      const left = glyph.width - glyph.xMax;
      minRsb = minRsb < left ? minRsb : left;

      xMin = xMin < glyph.xMin ? xMin : glyph.xMin;
      xMax = xMax > glyph.xMax ? xMax : glyph.xMax;
      yMin = yMin < glyph.yMin ? yMin : glyph.yMin;
      yMax = yMax > glyph.yMax ? yMax : glyph.yMax;

      maxWidth = maxWidth > glyph.width ? maxWidth : glyph.width;
      maxExtent = maxExtent > glyph.xMax ? maxExtent : glyph.xMax;
      totalWidth += glyph.width;
    }

    return {
      minLsb: minLsb,
      minRsb: minLsb < minRsb ? minLsb : minRsb,
      xMin: xMin,
      xMax: xMax < xMin ? xMin : xMax,
      yMin: yMin,
      yMax: yMax < yMin ? yMin : yMax,
      maxWidth: maxWidth,
      maxExtent: maxExtent,
      avgWidth: Math.round(totalWidth / this.glyphs.length),
    };
  }

  ySubscriptXSize(): number {
    return Math.floor(this.width * 0.6347);
  }

  ySubscriptYSize(): number {
    return Math.floor((this.ascent - this.descent) * 0.7);
  }

  ySubscriptYOffset(): number {
    return Math.floor((this.ascent - this.descent) * 0.14);
  }

  ySuperscriptXSize(): number {
    return Math.floor(this.width * 0.6347);
  }

  ySuperscriptYSize(): number {
    return Math.floor((this.ascent - this.descent) * 0.7);
  }

  ySuperscriptYOffset(): number {
    return Math.floor((this.ascent - this.descent) * 0.48);
  }

  yStrikeoutSize(): number {
    return Math.floor((this.ascent - this.descent) * 0.049);
  }

  yStrikeoutPosition(): number {
    return Math.floor((this.ascent - this.descent) * 0.258);
  }

  lineGap(): number {
    return Math.round((this.ascent - this.descent) * 0.09);
  }

  underlinePosition(): number {
    return Math.round((this.ascent - this.descent) * 0.01);
  }
}