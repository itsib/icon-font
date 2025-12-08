import { Glyph } from './glyph.ts';
import { slugify } from '../utils/slugify.ts';
import { toUCS2Bytes, toUTF8Bytes } from '../utils/string-to-bytes.ts';

export enum NameTableId {
  /**
   * Copyright notice.
   */
  Copyright = 0,
  /**
   * Font Family name.
   *
   * @description
   *    The Font Family name is used in combination with Font Subfamily
   *    name {@link NameTableId.FontSubFamily}, and should be shared among at
   *    most four fonts that differ only in weight or style (italic/oblique),
   *    as described below.
   *
   * {@tutorial nameExamples}
   * @example
   * - For "Arial Narrow"
   *   ```
   *   const names = [
   *      { id: NameTableId.FullName, value: 'Arial Narrow' },
   *      { id: NameTableId.FontSubFamily, value: 'Regular' },
   *      { id: NameTableId.FullName, value: 'Arial Narrow' },
   *      { id: NameTableId.TypoFamilyName, value: 'Arial' },
   *      { id: NameTableId.TypoSubFamilyName, value: 'Narrow' },
   *   ]
   *   ```
   *
   * - For "Arial Narrow Bold"
   *   ```
   *   const names = [
   *      { id: NameTableId.FullName, value: 'Arial Narrow' },
   *      { id: NameTableId.FontSubFamily, value: 'Bold' },
   *      { id: NameTableId.FullName, value: 'Arial Narrow Bold' },
   *      { id: NameTableId.TypoFamilyName, value: 'Arial' },
   *      { id: NameTableId.TypoSubFamilyName, value: 'Narrow Bold' },
   *   ]
   *   ```
   *
   * - For "Arial Narrow Bold Italic"
   *   ```
   *   const names = [
   *      { id: NameTableId.FullName, value: 'Arial Narrow' },
   *      { id: NameTableId.FontSubFamily, value: 'Bold Italic' },
   *      { id: NameTableId.FullName, value: 'Arial Narrow Bold Italic' },
   *      { id: NameTableId.TypoFamilyName, value: 'Arial' },
   *      { id: NameTableId.TypoSubFamilyName, value: 'Narrow Bold Italic' },
   *   ]
   *   ```
   *
   */
  FontFamily = 1,
  /**
   * Font Subfamily name.
   *
   * @description
   *   The Font Subfamily is used in combination with Font Family name
   *   {@link NameTableId.FontFamily}, and distinguishes the fonts in a group with the same
   *   Font Family name. This should be used for weight and style
   *   (italic/oblique) variants only.
   *
   * @see [Name examples]{@link NameTableId.FontFamily}
   */
  FontSubFamily = 2,
  /**
   * Unique font identifier.
   */
  ID = 3,
  /**
   * Full font name
   *
   * @description
   *   Full font name that reflects all family and relevant subfamily
   *   descriptors. The full font name is generally a combination of
   *   name {@link NameTableId.FontFamily} and {@link NameTableId.FontSubFamily},
   *   or of name {@link NameTableId.TypoFamilyName}
   *   and {@link NameTableId.TypoSubFamilyName}, or a similar human-readable
   *   variant.
   *
   * @see [Name examples]{@link NameTableId.FontFamily}
   */
  FullName = 4,
  /**
   * Version string
   *
   * @description
   *  Should begin with the pattern “Version <number>.<number>”
   *  (upper case, lower case, or mixed, with a space between
   *  “Version” and the number).
   */
  Version = 5,
  /**
   * PostScript name for the font.
   *
   * @description
   *   Name ID 6 specifies a string which is used to invoke a PostScript
   *   language font that corresponds to this OpenType font. When
   *   translated to ASCII, the name string must be no longer
   *   than 63 characters and restricted to the printable ASCII
   *   subset, codes 33 to 126, except for the 10 characters
   *   '[', ']', '(', ')', '{', '}', '<', '>', '/', '%'.
   */
  PostScriptName = 6,
  /**
   * Trademark.
   *
   * @description
   *   This is used to save any trademark notice/information for this
   *   font. Such information should be based on legal advice.
   *   This is distinctly separate from the copyright.
   */
  Trademark = 7,
  /**
   * Manufacturer Name.
   */
  Manufacturer = 8,
  /**
   * Designer.
   *
   * @description Name of the designer of the typeface.
   */
  Designer = 9,
  /**
   * Font description
   *
   * @description
   *    Description of the typeface. Can contain revision information,
   *    usage recommendations, history, features, etc.
   */
  Description = 10,
  /**
   * URL of Vendor.
   *
   * @description
   *   URL of font vendor (with protocol, e.g., http://, ftp://). If a
   *   unique serial number is embedded in the URL, it can be used to
   *   register the font.
   */
  URLVendor = 11,
  /**
   * URL of Designer.
   *
   * @description URL of typeface designer (with protocol, e.g., http://, ftp://).
   */
  URLDesigner = 12,
  /**
   * License Description.
   *
   * @description
   *   Description of the license or licenses under which the font is provided.
   *   This could be a reference to a named license agreement (e.g., a common
   *   open source licenses), identification of a software-use license under
   *   which a font is bundled, information about where to locate an external
   *   license @see {@link NameTableId.URLLicense}, a summary of permitted uses, or the full
   *   legal text of a license agreement. It is prudent to seek legal advice
   *   on the content of this name ID to avoid possible conflict of
   *   interpretation between it and the license(s).
   */
  License = 13,
  /**
   * License Info URL
   *
   * @description URL where additional licensing information can be found.
   */
  URLLicense = 14,
  /**
   * Typographic Family Name.
   *
   * @description
   *   The typographic family grouping doesn’t impose any constraints on the
   *   number of faces within it, in contrast with the 4-style family
   *   grouping {@link NameTableId.FontFamily}, which is present both for
   *   historical reasons and to express style linking groups.
   *   If name {@link NameTableId.TypoFamilyName} is absent, then
   *   name {@link NameTableId.FontFamily} is considered to be the typographic
   *   family name. (In earlier versions of the specification,
   *   name {@link NameTableId.TypoFamilyName} was known as “Preferred Family”.)
   *
   * @see [Name examples]{@link NameTableId.FontFamily}
   */
  TypoFamilyName = 16,
  /**
   * Typographic Subfamily name.
   *
   * @description
   *   This allows font designers to specify a subfamily name within
   *   the typographic family grouping. This string must be unique within a
   *   particular typographic family. If it is absent, then
   *   name {@link NameTableId.FontSubFamily} is considered to be the
   *   typographic subfamily name {@link NameTableId.TypoSubFamilyName}.
   *
   *   (In earlier versions of the specification,
   *   name {@link NameTableId.TypoSubFamilyName} was known
   *   as “Preferred Subfamily”.)
   *
   * @see [Name examples]{@link NameTableId.FontFamily}
   */
  TypoSubFamilyName = 17,
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
  glyphBoxSize: number;
  glyphTotalSize: number;
  glyphs: Glyph[];
  glyphsByCodePoints: { [codePoint: number]: Glyph };
  baselineOffset: number;
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
  readonly glyphsByCodePoints: { [key: number]: Glyph };
  readonly codePoints: number[];
  readonly glyphTotalSize: number;

  readonly ySubscriptXSize: number;
  readonly ySubscriptYSize: number;
  readonly ySubscriptYOffset: number;
  readonly ySuperscriptXSize: number;
  readonly ySuperscriptYSize: number;
  readonly ySuperscriptYOffset: number;
  readonly yStrikeoutSize: number;
  readonly yStrikeoutPosition: number;
  readonly lineGap: number;
  readonly underlinePosition: number;

  constructor(args: FontConstructorArgs) {
    // Font metadata
    this.id = slugify(args.fontFamily);
    this.fontFamily = args.fontFamily;
    this.fontSubFamily = args.fontSubFamily;
    this.copyright = args.metadata ?? `Copyright (c) itsib ${new Date().getFullYear()}`;
    this.description = args.description ?? '';
    this.url = args.url ?? '';
    this.created = Math.floor(Date.now() / 1000) + 2082844800;

    const baselineOffset = args.baselineOffset ?? 1
    const ascent = Math.floor(args.glyphBoxSize / baselineOffset);
    const descent = (args.glyphBoxSize - ascent);

    // Common font render params
    this.width = args.glyphBoxSize;
    this.height = args.glyphBoxSize;
    this.unitsPerEm = args.glyphBoxSize;
    this.ascent = ascent;
    this.descent = descent * -1;
    this.weight = 400;
    this.widthClass = 5; // Medium (normal)

    // glyphs
    this.glyphs = args.glyphs;
    this.glyphsByCodePoints = args.glyphsByCodePoints;
    this.codePoints = Object.keys(args.glyphsByCodePoints).map(codePoint => parseInt(codePoint, 10));
    this.glyphTotalSize = args.glyphTotalSize;

    // OS/2 table parameters
    this.ySubscriptXSize = Math.floor(this.width * 0.6347);
    this.ySubscriptYSize = Math.floor((this.ascent - this.descent) * 0.7);
    this.ySubscriptYOffset = Math.floor((this.ascent - this.descent) * 0.14);
    this.ySuperscriptXSize = Math.floor(this.width * 0.6347);
    this.ySuperscriptYSize = Math.floor((this.ascent - this.descent) * 0.7);
    this.ySuperscriptYOffset = Math.floor((this.ascent - this.descent) * 0.48);
    this.yStrikeoutSize = Math.floor((this.ascent - this.descent) * 0.049);
    this.yStrikeoutPosition = Math.floor((this.ascent - this.descent) * 0.258);
    this.lineGap = Math.round((this.ascent - this.descent) * 0.09);
    this.underlinePosition = Math.round((this.ascent - this.descent) * 0.01);
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

    add(NameTableId.Copyright, this.copyright);
    if (this.description) {
      add(NameTableId.Description, this.description);
    }
    if (this.url) {
      add(NameTableId.URLVendor, this.url);
    }
    add(NameTableId.ID, this.id);
    add(NameTableId.FontFamily, this.fontFamily);
    add(NameTableId.FontSubFamily, this.fontSubFamily);
    add(NameTableId.FullName, this.id);
    add(NameTableId.Version, 'Version 1.0');
    add(NameTableId.PostScriptName, this.id);

    names.sort((nameA, nameB) => {
      for (let i = 0; i < nameA.flags.length; i++) {
        if (nameA.flags[i] !== nameB.flags[i]) {
          return nameA.flags[i] < nameB.flags[i] ? -1 : 1;
        }
      }
      if (nameA.id === nameB.id) {
        return 0;
      }
      return nameA.id < nameB.id ? -1 : 1;
    });

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
}