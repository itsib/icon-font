import { Transform, TransformCallback } from 'node:stream';
import { BufferWithMeta, SymbolMeta } from '../../types/types.ts';
import { BRAND } from '../../constants.ts';
import { STYLES } from './styles.ts';
import { FontType } from '../../types';
import { slugify } from '../../utils/slugify.ts';
import { fontFaceUrl } from '../../utils/font-face.ts';
import { HEAD } from './head.ts';

const DIALOG = `
<dialog id="icon-dialog" role="alertdialog" aria-modal="true">
  <h3 class="header">
    <div id="dialog-header">Dialog</div>

    <button onclick="onClose()" type="button" class="close">✕</button>
  </h3>
  
  <div class="content">
    <div class="cell-1" >
      <i id="icon-demo" class="icon icon-folder-key icon-5x"></i>
    </div>
    <div class="cell-2">
      <div class="example">
        <code id="code-example"></code>
      </div>
      <button type="button" class="copy" aria-label="Copy to clipboard" onclick="onCopy(this)">
        <svg viewBox="0 0 512 512" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="m81.454 16c-35.902 0-65.454 29.552-65.454 65.454v218.18c0 35.902 29.552 65.454 65.454 65.454a21.818 21.818 0 0 0 21.818-21.818 21.818 21.818 0 0 0-21.818-21.818c-12.099 0-21.818-9.719-21.818-21.818v-218.18c0-12.099 9.719-21.818 21.818-21.818h218.18c12.099 0 21.818 9.719 21.818 21.818a21.818 21.818 0 0 0 21.818 21.818 21.818 21.818 0 0 0 21.818-21.818c0-35.902-29.552-65.454-65.454-65.454zm130.91 130.91c-35.884 0-65.454 29.57-65.454 65.454v218.18c0 35.884 29.57 65.454 65.454 65.454h218.18c35.884 0 65.454-29.57 65.454-65.454v-218.18c0-35.884-29.57-65.454-65.454-65.454zm0 43.636h218.18c12.465 0 21.818 9.3534 21.818 21.818v218.18c0 12.465-9.3534 21.818-21.818 21.818h-218.18c-12.465 0-21.818-9.3534-21.818-21.818v-218.18c0-12.465 9.3534-21.818 21.818-21.818z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
    <div class="cell-3">
      <div class="caption">Animations</div>
      <div id="animation-buttons" class="buttons">
        <button type="button" data-animation="beat" onclick="onAnimationClick(this)">beat</button>
        <button type="button" data-animation="bounce" onclick="onAnimationClick(this)">bounce</button>
        <button type="button" data-animation="fade" onclick="onAnimationClick(this)">fade</button>
        <button type="button" data-animation="beat-fade" onclick="onAnimationClick(this)">beat fade</button>
        <button type="button" data-animation="flip" onclick="onAnimationClick(this)">flip</button>
        <button type="button" data-animation="shake" onclick="onAnimationClick(this)">shake</button>
        <button type="button" data-animation="spin" onclick="onAnimationClick(this)">spin</button>
        <button type="button" data-animation="spin-reverse" onclick="onAnimationClick(this)">spin reverse</button>
        <button type="button" data-animation="pulse" onclick="onAnimationClick(this)">pulse</button>
        <button type="button" data-animation="spin-pulse" onclick="onAnimationClick(this)">spin pulse</button>
      </div>
    </div>
  </div>
</dialog>
`;

const FONT_SELECTOR = `
<div class="font-selector">
  <label for="font-select">Force select font-face</label>
  <div class="select-wrap">
    <select id="font-select" aria-errormessage="select-error" onchange="onFontSelect(this)">
      <option value="disabled">All Fonts Used</option>
      <option value="ttf">TrueType Font (ttf)</option>
      <option value="woff">Web Open Font Format (woff)</option>
      <option value="woff2">Web Open Font Format 2.0 (woff2)</option>
      <option value="eot">Embedded OpenType (eot)</option>
      <option value="svg">Scalable Vector Graphics (svg)</option>
    </select>
  </div>
  <div id="select-error" class="error"></div>
</div>
`;

export class TransformToHtml extends Transform {

  private readonly _fontName: string;

  private readonly _types: FontType[];

  private readonly _url: string;

  private readonly _prefix: string;

  private _isHeaderRendered = false;

  constructor(fontName: string, types: FontType[], prefix: string, url: string) {
    super({ objectMode: true });

    this._fontName = fontName;
    this._types = types;
    this._prefix = prefix;
    this._url = url;
  }

  private _header(): string {
    const fontId = slugify(this._fontName);
    const fontFaceUrls = this._types.reduce((acc, type) => ({ ...acc, [type]: encodeURIComponent(fontFaceUrl(this._url, fontId, type)) }), {})

    let output = '<!DOCTYPE html>\n';
    output += '<html lang="en">\n';
    output += HEAD
      .replace('{{caption}}', this._fontName)
      .replace('{{styles}}', STYLES)
      .replace('{{fontName}}', this._fontName)
      .replace('{{fontFaceUrls}}', JSON.stringify(fontFaceUrls));
    output += '<body>\n';
    output += `<h1 class="caption">\n`;
    output += BRAND + '\n';
    output += `</h1>\n`;
    output += FONT_SELECTOR + '\n';

    output += '<div class="buttons-container">\n';

    output += DIALOG;

    return output;
  }

  _transform(chunk: BufferWithMeta<SymbolMeta>, _encoding: BufferEncoding, callback: TransformCallback) {
    let output = '';
    if (!this._isHeaderRendered) {
      output += this._header();
      this._isHeaderRendered = true;
    }

    output += `
<button 
  type="button" 
  class="preview" 
  data-name=${chunk.metadata.name} 
  data-prefix=${this._prefix} 
  data-class="${this._prefix}-${chunk.metadata.name}" 
  onclick="onChooseIcon(this)"
>
  <span class="inner">
    <i class="${this._prefix} ${this._prefix}-${chunk.metadata.name}"></i>
  </span>
  <br>
  <span class="label">${chunk.metadata.name}</span>
</button>`;

    callback(null, output);
  }

  _flush(callback: TransformCallback) {
    callback(null, '</div>\n</body>\n</html>');
  }
}

