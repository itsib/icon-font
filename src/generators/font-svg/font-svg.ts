import { readFile } from 'node:fs/promises';
import { slugify } from '../../utils/slugify.js';
import { IconInfo, IconFontConfig } from '../../types.js';
import { parseSvg } from '../../utils/parse-svg.js';
import { SYMBOL_SIZE } from '../../utils/constants.js';

function renderHeader(fontName: string, metadata?: string) {
  const slug = slugify(fontName);
  let output = '<?xml version="1.0" standalone="no"?>\n';
  output += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >\n';
  output += '<svg xmlns="http://www.w3.org/2000/svg">\n';

  if (metadata) {
    output += `<metadata>${metadata}</metadata>\n`;
  }

  output += '<defs>\n';
  output += `  <font id="${slug}" horiz-adv-x="${SYMBOL_SIZE}">\n`;
  output += `    <font-face\n`;
  output += `        font-family="${fontName}"\n`;
  output += `        units-per-em="${SYMBOL_SIZE}"\n`;
  output += `        ascent="-${SYMBOL_SIZE}"\n`;
  output += `        descent="0"\n`;
  output += `        font-weight="400"\n`;
  output += `        font-style="Regular"\n`;
  output += `    />\n`;
  output += `    <missing-glyph horiz-adv-x="0" />\n`;

  return output;
}

function renderSymbol(file: IconInfo, svgPath: string) {
  let output = '';
  output += `    <glyph\n`;
  output += `        glyph-name="${file.id}"\n`;
  output += `        unicode="${file.unicode}"\n`;
  output += `        horiz-adv-x="${SYMBOL_SIZE}"\n`;
  output += `        d="${svgPath}"\n`;
  output += `    />\n`;

  return output;
}

function renderFooter() {
  let output = '';
  output += `  </font>\n`;
  output += `</defs>\n`;
  output += `</svg>\n`;
  return output;
}

export async function generateFontSvg(config: Omit<IconFontConfig, 'output'>, files: IconInfo[]): Promise<string> {
  let output = renderHeader(config.name);

  for (let i = 0; i < files.length; i++) {
    const svgIcon = await readFile(files[i].path, 'utf8');
    const svgPath = parseSvg(svgIcon);

    if (!svgPath) {
      continue;
    }
    output += renderSymbol(files[i], svgPath);
  }

  output += renderFooter();

  return output;
}
