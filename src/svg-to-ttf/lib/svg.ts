import { DOMParser, Element, LiveNodeList } from '@xmldom/xmldom';
import { ucs2decode } from './ucs2.ts';
import { Font, Glyph, Ligature } from './sfnt.ts';

function getGlyph(glyphElem: Element, fontInfo: Font): Glyph {
  const glyph: Partial<Glyph> = {
    d: '',
    unicode: []
  };

  if (glyphElem.hasAttribute('d')) {
    glyph.d = glyphElem.getAttribute('d')!.trim();
  } else {
    // try nested <path>
    const pathElem = glyphElem.getElementsByTagName('path')[0];

    if (pathElem && pathElem.hasAttribute('d')) {
      // <path> has reversed Y axis
      glyph.d = pathElem.getAttribute('d')!
    } else {
      throw new Error("Can't find 'd' attribute of <glyph> tag.");
    }
  }

  if (glyphElem.getAttribute('unicode')) {
    glyph.character = glyphElem.getAttribute('unicode')!;
    const unicode = ucs2decode(glyph.character);

    // If more than one code point is involved, the glyph is a ligature glyph
    if (unicode.length > 1) {
      glyph.ligature = glyph.character;
      glyph.ligatureCodes = unicode;
    } else {
      glyph.unicode!.push(unicode[0]);
    }
  }

  glyph.name = glyphElem.getAttribute('glyph-name') || undefined;

  if (glyphElem.getAttribute('horiz-adv-x')) {
    glyph.width = parseInt(glyphElem.getAttribute('horiz-adv-x')!, 10);
  }

  return glyph as Glyph;
}

function deduplicateGlyps(glyphs: Glyph[], ligatures: Ligature[]): Glyph[] {
  // Result (the list of unique glyphs)
  const result: Glyph[] = [];

  glyphs.forEach(glyph => {
    // Search for glyphs with the same properties (width and d)
    const canonical = result.find(_glyph => _glyph.width === glyph.width && _glyph.d === glyph.d);

    if (canonical) {
      // Add the code points to the unicode array.
      // The fields "name" and "character" are not that important so we leave them how we first enounter them and throw the rest away
      canonical.unicode = canonical.unicode.concat(glyph.unicode);
      glyph.canonical = canonical;
    } else {
      result.push(glyph);
    }
  });

  // Update ligatures to point to the canonical version
  ligatures.forEach(ligature => {
    while ('canonical' in  ligature.glyph) {
      ligature.glyph = ligature.glyph.canonical!;
    }
  });

  return result;
}

export function load(str: string): Font {
  const doc = new DOMParser().parseFromString(str, 'application/xml');

  const metadata = doc.getElementsByTagName('metadata')[0];
  const fontElem = doc.getElementsByTagName('font')[0];

  if (!fontElem) {
    throw new Error("Can't find <font> tag. Make sure you SVG file is font, not image.");
  }

  const fontFaceElem = fontElem.getElementsByTagName('font-face')[0];

  const familyName = fontFaceElem.getAttribute('font-family') || 'fontello';
  const subfamilyName = fontFaceElem.getAttribute('font-style') || 'Regular';
  const id = fontElem.getAttribute('id') || (familyName + '-' + subfamilyName).replace(/[\s\(\)\[\]<>%\/]/g, '').slice(0, 62);

  const font: Partial<Font> = {
    id: id,
    familyName: familyName,
    subfamilyName: subfamilyName,
    stretch: fontFaceElem.getAttribute('font-stretch') || 'normal',
    ascent: 0,
    glyphs: [],
    ligatures: []
  };

  // Doesn't work with complex content like <strong>Copyright:></strong><em>Fontello</em>
  if (metadata && metadata.textContent) {
    font.metadata = metadata.textContent;
  }

  // Get <font> numeric attributes
  const fontAttrs: { [key: string]: string } = {
    width: 'horiz-adv-x',
    horizOriginX: 'horiz-origin-x',
    horizOriginY: 'horiz-origin-y',
    vertOriginX: 'vert-origin-x',
    vertOriginY: 'vert-origin-y'
  };
  Object.entries(fontAttrs).forEach(function ([key, val]) {
    if (fontElem.hasAttribute(val)) {
      (font as any)[key] = parseInt(fontElem.getAttribute(val)!, 10);
    }
  });

  // Get <font-face> numeric attributes
  const fontFaceAttrs: { [key: string]: string } = {
    ascent: 'ascent',
    descent: 'descent',
    unitsPerEm: 'units-per-em',
    capHeight: 'cap-height',
    xHeight: 'x-height',
    underlineThickness: 'underline-thickness',
    underlinePosition: 'underline-position'
  };
  Object.entries(fontFaceAttrs).forEach(([key, val]) => {
    if (fontFaceElem.hasAttribute(val)) {
      (font as any)[key] = parseInt(fontFaceElem.getAttribute(val)!, 10);
    }
  });

  if (fontFaceElem.hasAttribute('font-weight')) {
    font.weightClass = fontFaceElem.getAttribute('font-weight')!;
  }

  const missingGlyphElem = fontElem.getElementsByTagName('missing-glyph')[0];

  if (missingGlyphElem) {
    font.missingGlyph = {
      d: missingGlyphElem.getAttribute('d') || ''
    };

    if (missingGlyphElem.getAttribute('horiz-adv-x')) {
      font.missingGlyph.width = parseInt(missingGlyphElem.getAttribute('horiz-adv-x')!, 10);
    }
  }

  let glyphs: Glyph[] = [];
  const ligatures: Ligature[] = [];

  const glyphElements: LiveNodeList<Element> = fontElem.getElementsByTagName('glyph');

  for (const glyphElement of glyphElements) {
    const glyph = getGlyph(glyphElement, font as Font);

    if ('ligature' in glyph) {
      ligatures.push({
        ligature: glyph.ligature!,
        unicode: glyph.ligatureCodes!,
        glyph: glyph
      });
    }

    glyphs.push(glyph);
  }

  glyphs = deduplicateGlyps(glyphs, ligatures);

  font.glyphs = glyphs;
  font.ligatures = ligatures;

  return font as Font;
}


