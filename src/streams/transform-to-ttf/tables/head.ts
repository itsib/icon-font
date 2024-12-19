import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';

export function createHeadTable(font: Font): BufferByte {
  const buffer = new BufferByte(54); // fixed table length

  const { xMin, xMax, yMax, yMin } = font.getBounds();

  buffer.writeUint16(1)                 // Major version number of the font header table — set to 1.
  buffer.writeUint16(0)                 // Minor version number of the font header table — set to 0.
  buffer.writeInt32(0x10000);           // fontRevision - Set by font manufacturer.
  buffer.writeUint32(0);                // checkSumAdjustment - To compute: set it to 0, sum the entire font as uint32, then store 0xB1B0AFBA - sum. If the font is used as a component in a font collection file, the value of this field will be invalidated by changes to the file structure and font table directory, and must be ignored.
  buffer.writeUint32(0x5F0F3CF5);       // magicNumber - Set to 0x5F0F3CF5.
  /**
   * Bit flags
   *
   * Bit 0: Baseline for font at y=0.
   * Bit 1: Left sidebearing point at x=0 (relevant only for TrueType rasterizers) — see additional information below regarding variable fonts.
   * Bit 2: Instructions may depend on point size.
   * Bit 3: Force ppem to integer values for all internal scaler math; may use fractional ppem sizes if this bit is clear. It is strongly recommended that this be set in hinted fonts.
   * Bit 4: Instructions may alter advance width (the advance widths might not scale linearly).
   * Bit 5: This bit is not used in OpenType, and should not be set in order to ensure compatible behavior on all platforms. If set, it may result in different behavior for vertical layout in some platforms. (See Apple’s specification for details regarding behavior in Apple platforms.)
   * Bits 6 – 10: These bits are not used in OpenType and should always be cleared. (See Apple’s specification for details regarding legacy use in Apple platforms.)
   * Bit 11: Font data is “lossless” as a result of having been subjected to optimizing transformation and/or compression (such as compression mechanisms defined by ISO/IEC 14496-18, MicroType® Express, WOFF 2.0, or similar) where the original font functionality and features are retained but the binary compatibility between input and output font files is not guaranteed. As a result of the applied transform, the DSIG table may also be invalidated.
   * Bit 12: Font converted (produce compatible metrics).
   * Bit 13: Font optimized for ClearType®. Note, fonts that rely on embedded bitmaps (EBDT) for rendering should not be considered optimized for ClearType, and therefore should keep this bit cleared.
   * Bit 14: Last Resort font. If set, indicates that the glyphs encoded in the 'cmap' subtables are simply generic symbolic representations of code point ranges and do not truly represent support for those code points. If unset, indicates that the glyphs encoded in the 'cmap' subtables represent proper support for those code points.
   * Bit 15: Reserved, set to 0.
   */
  buffer.writeUint16(0b000000001011);   // 15....0
  buffer.writeUint16(font.unitsPerEm);  // unitsPerEm - Set to a value from 16 to 16384. Any value in this range is valid. In fonts that have TrueType outlines, a power of 2 is recommended as this allows performance optimization in some rasterizers.
  buffer.writeUint64(font.created);     // created - Number of seconds since 12:00 midnight that started January 1st, 1904, in GMT/UTC time zone.
  buffer.writeUint64(font.created);     // modified - Number of seconds since 12:00 midnight that started January 1st, 1904, in GMT/UTC time zone.
  buffer.writeInt16(xMin);              // xMin - Minimum x coordinate across all glyph bounding boxes.
  buffer.writeInt16(yMin);              // yMin - Minimum y coordinate across all glyph bounding boxes.
  buffer.writeInt16(xMax);              // xMax - Maximum x coordinate across all glyph bounding boxes.
  buffer.writeInt16(yMax);              // yMax - Maximum y coordinate across all glyph bounding boxes.
  /**
   * Mac style bit flags
   * Bit 0: Bold (if set to 1);
   * Bit 1: Italic (if set to 1)
   * Bit 2: Underline (if set to 1)
   * Bit 3: Outline (if set to 1)
   * Bit 4: Shadow (if set to 1)
   * Bit 5: Condensed (if set to 1)
   * Bit 6: Extended (if set to 1)
   * Bits 7 – 15: Reserved (set to 0).
   */
  buffer.writeUint16(0);                // macStyle
  buffer.writeUint16(8);                // lowestRecPPEM - Smallest readable size in pixels.
  /**
   * Font Direction Hint
   * @deprecated (Set to 2).
   * 0: Fully mixed directional glyphs;
   * 1: Only strongly left to right;
   * 2: Like 1 but also contains neutrals;
   * -1: Only strongly right to left;
   * -2: Like -1 but also contains neutrals.
   */
  buffer.writeInt16(2);                 // fontDirectionHint
  buffer.writeInt16(font.glyphTotalSize < 0x20000 ? 0 : 1); // indexToLocFormat - 0 for short offsets (Offset16), 1 for long (Offset32).
  buffer.writeInt16(0);                 // glyphDataFormat - 0 for current format.

  return buffer;
}

