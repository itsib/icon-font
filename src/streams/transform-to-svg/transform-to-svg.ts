import { Transform, TransformCallback } from 'node:stream';
import { SVGPathData } from 'svg-pathdata';
import { slugify } from '../../utils/slugify.ts';
import { BufferWithMeta, SymbolMetadata } from '../../types';
import { encodeHtml } from '../../utils/coders.ts';

export class TransformToSvg extends Transform {

  private readonly _fontName: string;

  private readonly _metadata?: string;

  private _isHeaderRendered = false;

  constructor(fontName: string, metadata?: string) {
    super({ objectMode: true });

    this._fontName = fontName;
    this._metadata = metadata;
  }

  private _header(symbolSize: number): string {
    const slug = slugify(this._fontName);
    let output = '<?xml version="1.0" standalone="no"?>\n';
    output += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >\n';
    output += '<svg xmlns="http://www.w3.org/2000/svg">\n';

    if (this._metadata) {
      output += `<metadata>${this._metadata}</metadata>\n`;
    }

    output += '<defs>\n';
    output += `  <font id="${slug}" horiz-adv-x="${symbolSize}">\n`;
    output += `    <font-face\n`;
    output += `        font-family="${this._fontName}"\n`;
    output += `        units-per-em="${symbolSize}"\n`;
    output += `        ascent="-${symbolSize}"\n`;
    output += `        descent="0"\n`;
    output += `        font-size="16"\n`;
    output += `        widths="16"\n`;
    output += `        font-weight="400"\n`;
    output += `        font-style="Regular"\n`;
    output += `    />\n`;
    output += `    <missing-glyph horiz-adv-x="0" />\n`;

    return output;
  }

  _transform(chunk: BufferWithMeta<SymbolMetadata>, _encoding: BufferEncoding, callback: TransformCallback) {
    const size = Math.max(chunk.metadata.width, chunk.metadata.height);
    let output = '';
    if (!this._isHeaderRendered) {
      output += this._header(size);
      this._isHeaderRendered = true;
    }

    const path = new SVGPathData(chunk.toString())
      .encode();

    output += `    <glyph\n`;
    output += `        glyph-name="${chunk.metadata.name}"\n`;
    output += `        unicode="${encodeHtml([chunk.metadata.codepoint])}"\n`;
    output += `        horiz-adv-x="${size}"\n`;
    output += `        d="${path}"\n`;
    output += `    />\n`;

    callback(null, Buffer.from(output, 'utf8'));
  }

  _flush(callback: TransformCallback) {
    let output = '';
    output += `  </font>\n`;
    output += `</defs>\n`;
    output += `</svg>\n`;

    callback(null, Buffer.from(output, 'utf8'));
  }
}