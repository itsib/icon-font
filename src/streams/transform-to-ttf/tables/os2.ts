import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';
import { tableIdentifier } from '../../../utils/string-to-bytes.ts';

/**
 * OS/2 Table (Windows or macOS)
 *
 * @see {@link [OS/2](https://learn.microsoft.com/en-us/typography/opentype/spec/os2)}
 *
 * @param {Font} font
 */
export function createOS2Table(font: Font): BufferByte {
  const buf = new BufferByte(96);

  const firstCharIndex = Math.max(0, Math.min(0xffff, Math.abs(Math.min(...font.codePoints) || 0)));
  const lastCharIndex = Math.max(0, Math.min(0xffff, Math.abs(Math.max(...font.codePoints) || 0)));

  const { yMax, yMin, avgWidth } = font.getBounds();

  // Version 5 is not supported in the Android 5 browser.
  buf.writeUint16(4); // version
  buf.writeInt16(avgWidth); // xAvgCharWidth
  buf.writeUint16(font.weight); // usWeightClass
  buf.writeUint16(font.widthClass); // usWidthClass
  buf.writeInt16(0); // fsType
  buf.writeInt16(font.ySubscriptXSize); // ySubscriptXSize
  buf.writeInt16(font.ySubscriptYSize); //ySubscriptYSize
  buf.writeInt16(0); // ySubscriptXOffset
  buf.writeInt16(font.ySubscriptYOffset); // ySubscriptYOffset
  buf.writeInt16(font.ySuperscriptXSize); // ySuperscriptXSize
  buf.writeInt16(font.ySuperscriptYSize); // ySuperscriptYSize
  buf.writeInt16(0); // ySuperscriptXOffset
  buf.writeInt16(font.ySuperscriptYOffset); // ySuperscriptYOffset
  buf.writeInt16(font.yStrikeoutSize); // yStrikeoutSize
  buf.writeInt16(font.yStrikeoutPosition); // yStrikeoutPosition
  buf.writeInt16(0); // sFamilyClass
  buf.writeUint8(2); // panose.familyType
  buf.writeUint8(0); // panose.serifStyle
  buf.writeUint8(5); // panose.weight
  buf.writeUint8(3); // panose.proportion
  buf.writeUint8(0); // panose.contrast
  buf.writeUint8(0); // panose.strokeVariation
  buf.writeUint8(0); // panose.armStyle
  buf.writeUint8(0); // panose.letterform
  buf.writeUint8(0); // panose.midline
  buf.writeUint8(0); // panose.xHeight
  // TODO: This field is used to specify the Unicode blocks or ranges based on the 'cmap' table.
  buf.writeUint32(0); // ulUnicodeRange1
  buf.writeUint32(0); // ulUnicodeRange2
  buf.writeUint32(0); // ulUnicodeRange3
  buf.writeUint32(0); // ulUnicodeRange4
  buf.writeUint32(tableIdentifier('ITSB')); // achVendID - Font Vendor Identification
  /**
   * Bit 6 - REGULAR Glyphs are in the standard weight/style for the font.
   * Bit 7 - USE_TYPO_METRICS	If set, it is strongly recommended that
   *         applications use
   *         OS/2.sTypoAscender - OS/2.sTypoDescender + OS/2.sTypoLineGap
   *         as the default line spacing for this font.
   */
  buf.writeUint16(0b11000000); // fsSelection - Font selection flags.
  buf.writeUint16(firstCharIndex); // usFirstCharIndex
  buf.writeUint16(lastCharIndex); // usLastCharIndex
  buf.writeInt16(font.ascent); // sTypoAscender
  buf.writeInt16(font.descent); // sTypoDescender  Math.floor(args.unitsPerEm / 1.3333333333333333);
  buf.writeInt16(font.lineGap); // lineGap
  // Enlarge win acscent/descent to avoid clipping
  // WinAscent - WinDecent should at least be equal to TypoAscender - TypoDescender + TypoLineGap:
  // https://www.high-logic.com/font-editor/fontcreator/tutorials/font-metrics-vertical-line-spacing
  buf.writeInt16(Math.max(yMax, font.ascent + font.lineGap)); // usWinAscent
  buf.writeInt16(-Math.min(yMin, font.descent)); // usWinDescent
  buf.writeInt32(1); // ulCodePageRange1, Latin 1
  buf.writeInt32(0); // ulCodePageRange2
  buf.writeInt16(0); // sxHeight
  buf.writeInt16(0); // sCapHeight
  buf.writeUint16(0); // usDefaultChar, pointing to missing glyph (always id=0)
  buf.writeUint16(0); // usBreakChar, code=32 isn't guaranteed to be a space in icon fonts
  buf.writeUint16(2); // usMaxContext, use at least 2 for ligatures and kerning

  return buf;
}

