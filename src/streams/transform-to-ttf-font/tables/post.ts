import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';
import { stringToAscII } from '../../../utils/string-to-bytes.ts';

function tableSize(font: Font, names: Uint8Array[]): number {
  let result = 36; // table header

  result += font.glyphs.length * 2; // name declarations
  names.forEach(name => {
    result += name.length;
  });
  return result;
}

export function createPostTable(font: Font): BufferByte {
  const names: Uint8Array[] = [];

  font.glyphs.forEach(glyph => {
    if (glyph.unicode?.length !== 0) {
      names.push(stringToAscII(glyph.name));
    }
  });

  const buf = new BufferByte(tableSize(font, names));

  buf.writeInt32(0x20000); // formatType,  version 2.0
  buf.writeInt32(font.italicAngle); // italicAngle
  buf.writeInt16(font.underlinePosition); // underlinePosition
  buf.writeInt16(font.underlineThickness); // underlineThickness
  buf.writeUint32(font.isFixedPitch); // isFixedPitch
  buf.writeUint32(0); // minMemType42
  buf.writeUint32(0); // maxMemType42
  buf.writeUint32(0); // minMemType1
  buf.writeUint32(0); // maxMemType1
  buf.writeUint16(font.glyphs.length); // numberOfGlyphs

  // Array of glyph name indexes
  let index = 258; // first index of custom glyph name, it is calculated as glyph name index + 258

  font.glyphs.forEach(glyph => {
    if (glyph.unicode?.length === 0) {
      buf.writeUint16(0); // missed element should have .notDef name in the Macintosh standard order.
    } else {
      buf.writeUint16(index++);
    }
  });

  // Array of glyph name indexes
  names.forEach(name => {
    buf.writeBytes(name);
  });

  return buf;
}
