import { Transform } from 'node:stream';
import type { TransformCallback } from 'node:stream';
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
        <input type="color" id="color-picker" value="#888888" oninput="onColorChange(event)">
      </div>
    </div>
    <div class="cell-3">
      <div class="caption">Animations</div>
      <div id="animation-buttons" class="buttons">
        <button type="button" class="btn btn-outline" data-animation="beat" onclick="onAnimationClick(this)">beat</button>
        <button type="button" class="btn btn-outline" data-animation="bounce" onclick="onAnimationClick(this)">bounce</button>
        <button type="button" class="btn btn-outline" data-animation="fade" onclick="onAnimationClick(this)">fade</button>
        <button type="button" class="btn btn-outline" data-animation="beat-fade" onclick="onAnimationClick(this)">beat fade</button>
        <button type="button" class="btn btn-outline" data-animation="flip" onclick="onAnimationClick(this)">flip</button>
        <button type="button" class="btn btn-outline" data-animation="shake" onclick="onAnimationClick(this)">shake</button>
        <button type="button" class="btn btn-outline" data-animation="spin" onclick="onAnimationClick(this)">spin</button>
        <button type="button" class="btn btn-outline" data-animation="spin-reverse" onclick="onAnimationClick(this)">spin reverse</button>
        <button type="button" class="btn btn-outline" data-animation="pulse" onclick="onAnimationClick(this)">pulse</button>
        <button type="button" class="btn btn-outline" data-animation="spin-pulse" onclick="onAnimationClick(this)">spin pulse</button>
      </div>
    </div>
  </div>
</dialog>
<dialog id="info-dialog" role="alertdialog" aria-modal="true" onclick="backdropClickInfoModal(event, this)">
  <h3 class="header">
    <div id="dialog-header">Handbook of Class Utilities</div>

    <button onclick="closeInfoModal()" type="button" class="close">✕</button>
  </h3>
  <div class="content">
  <table class="class-utils-list">
    <tbody>
      <tr>
        <th colspan="2" style="font: 500 14px sans-serif; padding-top: 8px">Icon Size Utils</th>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-1x ... {{prefix}}-10x</td>
        <td class="">1em - 10em</td>
      </tr>
      <tr><td class="cn">{{prefix}}-2xs</td><td>Font Size: 0.625em</td></tr>
      <tr><td class="cn">{{prefix}}-xs</td><td>Font Size: 0.75em</td></tr>
      <tr><td class="cn">{{prefix}}-sm</td><td>Font Size: 0.875em</td></tr>
      <tr><td class="cn">{{prefix}}-lg</td><td>Font Size: 1.25em</td></tr>
      <tr><td class="cn">{{prefix}}-xl</td><td>Font Size: 1.5em</td></tr>
      <tr><td class="cn">{{prefix}}-2xl</td><td>Font Size: 2em</td></tr>
      <tr><td class="cn">{{prefix}}-3xl</td><td>Font Size: 2.5em</td></tr>
    </tbody>
    <tbody>
      <tr>
        <th colspan="2" style="font: 500 14px sans-serif; padding-top: 8px">Format & Align Utils</th>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-fw</td>
        <td class="">Align: center, Width: 1.25em</td>
      </tr>
    </tbody>
    <tbody>
      <tr>
        <th colspan="2" style="font: 500 14px sans-serif; padding-top: 8px">Animations Utils</th>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-beat</td>
        <td class="">Scale an icon up or down</td>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-fade</td>
        <td class="">Fade an icon in and out visually</td>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-beat-fade</td>
        <td class="">Visually scaling and pulsing an icon in and out</td>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-bounce</td>
        <td class="">Visually bouncing an icon up and down</td>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-flip</td>
        <td class="">Rotate an icon in 3D space</td>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-shake</td>
        <td class="">Shaking an icon back and forth</td>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-spin</td>
        <td class="">Makes an icon spin 360° clockwise</td>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-spin-pulse</td>
        <td class="">Makes an icon spin 360° clockwise in 8 incremental steps</td>
      </tr>
      <tr>
        <td class="cn">{{prefix}}-spin-reverse</td>
        <td class="">When used in conjunction with fa-spin or fa-spin-pulse, makes an icon spin counter-clockwise</td>
      </tr>
    </tbody>
  </table>
  </div>
</dialog>
`;

export class TransformToNuxt extends Transform {

  private readonly _fontName: string;

  private readonly _types: FontType[];

  private readonly _base: string;

  private readonly _prefix: string;

  private _isHeaderRendered = false;

  constructor(fontName: string, types: FontType[], prefix: string, base: string = '') {
    super({ objectMode: true });

    this._fontName = fontName;
    this._types = types;
    this._prefix = prefix;
    this._base = base;
  }

  private _header(): string {
    const fontId = slugify(this._fontName);
    const fontFaceUrls = this._types.reduce((acc, type) => ({ ...acc, [type]: encodeURIComponent(fontFaceUrl(this._base, fontId, type)) }), {})

    let output = '<!DOCTYPE html>\n';
    output += '<html lang="en">\n';
    output += HEAD
      .replace('{{caption}}', this._fontName)
      .replace('{{styles}}', STYLES)
      .replace('{{fontName}}', this._fontName)
      .replace('{{fontFaceUrls}}', JSON.stringify(fontFaceUrls))
      .replace(/\{\{base}}/gm, this._base);

    output += '<body>\n';
    output += `<h1 class="caption">\n`;
    output += BRAND + '\n';
    output += '<div class="size-selector">\n';
    output += '  <button type="button"  class="btn btn-outline" onclick="setZoom(this)" data-zoom="+1"><i class="icon icon-zoom-out"></i></button>\n';
    output += '  <button type="button"  class="btn btn-outline" onclick="setZoom(this)" data-zoom="-1"><i class="icon icon-zoom-in"></i></button>\n';
    output += '  <button type="button"  class="btn btn-outline" onclick="openInfoModal(this)"><i class="icon icon-info"></i></button>\n';
    output += '</div>\n';
    output += `</h1>\n`;

    output += DIALOG.replace(/\{\{prefix}}/gm, this._prefix);

    output += '<div class="buttons-container">\n';
    output += '   <div class="scrollable">\n';

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
  aria-label="${chunk.metadata.name}"
  data-name="${chunk.metadata.name}" 
  data-prefix="${this._prefix}" 
  data-class="${this._prefix}-${chunk.metadata.name}" 
  onclick="onChooseIcon(this)"
>
  <span class="inner">
    <i class="${this._prefix} ${this._prefix}-${chunk.metadata.name}"></i>
  </span>
</button>`;

    callback(null, output);
  }

  _flush(callback: TransformCallback) {
    callback(null, '</div>\n</div>\n</body>\n</html>');
  }
}

