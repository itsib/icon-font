import { Transform, TransformCallback } from 'node:stream';
import { BufferWithMeta, SymbolMetadata, FontType } from '../../types';
import { BRAND } from '../../utils/constants.ts';
import { STYLES } from './styles.ts';
import { slugify } from '../../utils/slugify.ts';
import { fontFaceUrl } from '../../utils/font-face.ts';
import { HEAD } from './head.ts';

const DIALOG = `
<dialog id="icon-dialog" role="alertdialog" aria-modal="true" onclick="onDialogClick(event, this)">
  <h3 class="header">
    <div id="dialog-header">Dialog</div>

    <button onclick="onClose()" type="button" class="close">✕</button>
  </h3>
  
  <div class="content">
    <div class="cell-1" >
      <i id="icon-demo" class="icon icon-folder-key icon-5x"></i>
    </div>
    <div class="cell-2">
      <div aria-label="Copy to clipboard" onclick="onCopy(this)">
         <div class="example">
          <code id="code-example"></code>
        </div>
      </div>
      
      <div class="color-picker">
        <label for="color-picker">Icon color picker</label>
        <input type="color" id="color-picker" value="#ffffff" oninput="onColorChange(event)">
      </div>
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

  _transform(chunk: BufferWithMeta<SymbolMetadata>, _encoding: BufferEncoding, callback: TransformCallback) {
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

