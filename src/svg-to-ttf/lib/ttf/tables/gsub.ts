import { identifier } from '../utils.ts';
import ByteBuffer from 'microbuffer';
import { Font, Ligature, LigatureGroup } from '../../sfnt.ts';

function createScript(): ByteBuffer {
  /**
   * +2 Script DefaultLangSys Offset
   * +2 Script[0] LangSysCount (0)
   */
  const scriptRecord = 4;
  /**
   * +2 Script DefaultLangSys LookupOrder
   * +2 Script DefaultLangSys ReqFeatureIndex
   * +2 Script DefaultLangSys FeatureCount (0?)
   * +2 Script Optional Feature Index[0]
   */
  const langSys = 8;

  const length = scriptRecord + langSys;

  const buffer = new ByteBuffer(length);

  // Script Record
  // Offset to the start of langSys from the start of scriptRecord
  buffer.writeUint16(scriptRecord); // DefaultLangSys

  // Number of LangSys entries other than the default (none)
  buffer.writeUint16(0);

  // LangSys record (DefaultLangSys)
  // LookupOrder
  buffer.writeUint16(0);
  // ReqFeatureIndex -> only one required feature: all ligatures
  buffer.writeUint16(0);
  // Number of FeatureIndex values for this language system (excludes the required feature)
  buffer.writeUint16(1);
  // FeatureIndex for the first optional feature
  buffer.writeUint16(0);

  return buffer;
}

function createScriptList(): ByteBuffer {
  /**
   * +4 Tag
   * +2 Offset
   */
  const scriptSize = 6;

  // tags should be arranged alphabetically
  const scripts: [string, ByteBuffer][] = [
    ['DFLT', createScript()],
    ['latn', createScript()]
  ];

  /**
   * +2 Script count
   */
  const header = 2 + scripts.length * scriptSize;

  const sizes = scripts.map((script) => script[1].length);
  const tableLengths = sizes.reduce((result, count) => result + count, 0);

  const length = header + tableLengths;

  const buffer = new ByteBuffer(length);

  // Script count
  buffer.writeUint16(scripts.length);

  // Write all ScriptRecords
  let offset = header;

  scripts.forEach(script => {
    const name = script[0], table = script[1];

    // Script identifier (DFLT/latn)
    buffer.writeUint32(identifier(name));
    // Offset to the ScriptRecord from start of the script list
    buffer.writeUint16(offset);
    // Increment offset by script table length
    offset += table.length;
  });

  // Write all ScriptTables
  scripts.forEach(script => {
    const table = script[1];

    buffer.writeBytes(table.buffer);
  });

  return buffer;
}

// Write one feature containing all ligatures
function createFeatureList(): ByteBuffer {
  /**
   * +2 FeatureCount
   * +4 FeatureTag[0]
   * +2 Feature Offset[0]
   */
  const header = 8;
  /**
   * +2 FeatureParams[0]
   * +2 LookupCount[0]
   * +2 Lookup[0] LookupListIndex[0]
   */
  const length = header + 6;

  const buffer = new ByteBuffer(length);

  // FeatureCount
  buffer.writeUint16(1);
  // FeatureTag[0]
  buffer.writeUint32(identifier('liga'));
  // Feature Offset[0]
  buffer.writeUint16(header);
  // FeatureParams[0]
  buffer.writeUint16(0);
  // LookupCount[0]
  buffer.writeUint16(1);
  // Index into lookup table. Since we only have ligatures, the index is always 0
  buffer.writeUint16(0);

  return buffer;
}

function createLigatureCoverage(font: Font, ligatureGroups: LigatureGroup[]): ByteBuffer {
  const glyphCount = ligatureGroups.length;

  /**
   * +2 CoverageFormat
   * +2 GlyphCount
   */
  const length = 4 + (2 * glyphCount);

  const buffer = new ByteBuffer(length);

  // CoverageFormat
  buffer.writeUint16(1);

  // Length
  buffer.writeUint16(glyphCount);

  ligatureGroups.forEach(group => {
    buffer.writeUint16(group.startGlyph.id);
  });

  return buffer;
}

function createLigatureTable(font: any, ligature: any): ByteBuffer {
  const allCodePoints = font.codePoints;

  const unicode = ligature.unicode;
  /**
   * +2 LigGlyph
   * +2 CompCount
   */
  const length = 4 + 2 * (unicode.length - 1);

  const buffer = new ByteBuffer(length);

  // LigGlyph
  let glyph = ligature.glyph;

  buffer.writeUint16(glyph.id);

  // CompCount
  buffer.writeUint16(unicode.length);

  // Compound glyphs (excluding first as it’s already in the coverage table)
  for (let i = 1; i < unicode.length; i++) {
    glyph = allCodePoints[unicode[i]];
    buffer.writeUint16(glyph.id);
  }

  return buffer;
}

function createLigatureSet(font: Font, codePoint: number, ligatures: Ligature[]): ByteBuffer {
  const ligatureTables: ByteBuffer[] = [];

  ligatures.forEach(ligature => {
    ligatureTables.push(createLigatureTable(font, ligature));
  });

  const tableLengths = ligatureTables.reduce((acc, l) => acc + l.length, 0);

  /**
   * +2 LigatureCount
   */
  let offset = 2 + 2 * ligatures.length;

  const length = offset + tableLengths;

  const buffer = new ByteBuffer(length);

  // LigatureCount
  buffer.writeUint16(ligatures.length);

  // Ligature offsets
  ligatureTables.forEach(table => {
    // The offset to the current set, from SubstFormat
    buffer.writeUint16(offset);
    offset += table.length;
  });

  // Ligatures
  ligatureTables.forEach(table => {
    buffer.writeBytes(table.buffer);
  });

  return buffer;
}

function createLigatureList(font: Font, ligatureGroups: LigatureGroup[]): ByteBuffer {
  const sets: ByteBuffer[] = [];

  ligatureGroups.forEach(group => {
    const set = createLigatureSet(font, group.codePoint, group.ligatures);

    sets.push(set);
  });

  const setLengths = sets.reduce((acc, item) => acc + item.length, 0);

  const coverage = createLigatureCoverage(font, ligatureGroups);

  /**
   * +2 Lookup type
   * +2 Lokup flag
   * +2 SubTableCount
   * +2 SubTable[0] Offset
   */
  const tableOffset = 8;
  /**
   * +2 SubstFormat
   * +2 Coverage offset
   * +2 LigSetCount
   */
  let setOffset = 6  + 2 * sets.length;

  const coverageOffset = setOffset + setLengths;

  const length = tableOffset + coverageOffset + coverage.length;

  const buffer = new ByteBuffer(length);

  // Lookup type 4 – ligatures
  buffer.writeUint16(4);

  // Lookup flag – empty
  buffer.writeUint16(0);

  // Subtable count
  buffer.writeUint16(1);

  // Subtable[0] offset
  buffer.writeUint16(tableOffset);

  // SubstFormat
  buffer.writeUint16(1);

  // Coverage
  buffer.writeUint16(coverageOffset);

  // LigSetCount
  buffer.writeUint16(sets.length);

  sets.forEach(set => {
    // The offset to the current set, from SubstFormat
    buffer.writeUint16(setOffset);
    setOffset += set.length;
  });

  sets.forEach((set) => {
    buffer.writeBytes(set.buffer);
  });

  buffer.writeBytes(coverage.buffer);

  return buffer;
}

// Add a lookup for each ligature
function createLookupList(font: Font): ByteBuffer {
  const ligatures = font.ligatures;

  const groupedLigatures: { [key: number]: Ligature[] } = {};

  // Group ligatures by first code point
  ligatures.forEach(ligature => {
    const first = ligature.unicode[0];

    if (!(first in groupedLigatures)) {
      groupedLigatures[first] = [];
    }
    groupedLigatures[first].push(ligature);
  });

  const ligatureGroups: LigatureGroup[] = [];

  Object.entries(groupedLigatures).forEach(([_codePoint, ligatures]) => {
    const codePoint = parseInt(_codePoint, 10);
    // Order ligatures by length, descending
    ligatures.sort((ligA, ligB) => ligB.unicode.length - ligA.unicode.length);
    ligatureGroups.push({
      codePoint: codePoint,
      ligatures: ligatures,
      startGlyph: font.codePoints[codePoint]
    });
  });

  ligatureGroups.sort((a, b) => a.startGlyph.id - b.startGlyph.id);
  /**
   * +2 Lookup count
   * +2 Lookup[0] offset
   */
  const offset = 4;

  const set = createLigatureList(font, ligatureGroups);

  const length = offset + set.length;

  const buffer = new ByteBuffer(length);

  // Lookup count
  buffer.writeUint16(1);

  // Lookup[0] offset
  buffer.writeUint16(offset);

  // Lookup[0]
  buffer.writeBytes(set.buffer);

  return buffer;
}

export default function createGSUB(font: Font): ByteBuffer {
  const scriptList = createScriptList();
  const featureList = createFeatureList();
  const lookupList = createLookupList(font);

  const lists: ByteBuffer[] = [scriptList, featureList, lookupList];

  /**
   * +4 Version
   */
  let offset = 4  + 2 * lists.length;

  // Calculate offsets
  lists.forEach(list => {
    (list as any)['_listOffset'] = offset;
    offset += list.length;
  });

  const length = offset;
  const buffer = new ByteBuffer(length);

  // Version
  buffer.writeUint32(0x00010000);

  // Offsets
  lists.forEach(list => {
    buffer.writeUint16((list as any)['_listOffset']);
  });

  // List contents
  lists.forEach(list => {
    buffer.writeBytes(list.buffer);
  });

  return buffer;
}


