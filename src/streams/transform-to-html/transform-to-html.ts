import { Transform, TransformCallback } from 'node:stream';
import { BufferWithMeta, SymbolMeta } from '../../types/types.ts';
import { BRAND, FAVICON } from '../../constants.ts';

const HEAD = `
<head>
  <meta charset="UTF-8">
  <title>{{caption}}</title>
  <link rel="shortcut icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    html {
      --border-radius: 8px;
      --preview-bg: 2 6 23;
      --label-bg: 12 74 110;

      color: #e2e8f0;
      background: #0f172a;
    }
    body {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif, ui-sans-serif, 
                    system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", 
                    Roboto, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", 
                   "Segoe UI Symbol", "Noto Color Emoji";
      font-weight: 300;
      font-size: 16px;
      margin: 0;
      text-align: center;
    }
    .caption {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .caption svg {
      width: auto;
      height: 56px;
    }
    .caption svg .text-paths {
      color: white !important;
    }
    .buttons-container {
      width: auto;
      max-width: 1280px;
      margin: 0 auto;
      padding: 10px 20px;
    }
    .preview {
      width: 110px;
      height: 130px;
      margin: 10px;
      display: inline-block;
      border: none;
      background-color: transparent;
      color: inherit;
      outline: none;
      padding: 0;
      border-radius: var(--border-radius);
      position: relative;
    }
    .preview .inner {
      display: inline-block;
      width: 100%;
      text-align: center;
      background: rgb(var(--preview-bg) / 0.7);
      border-radius: var(--border-radius) var(--border-radius) 0 0;
    }
    .preview .inner i {
      line-height: 100px;
      font-size: 36px;
    }
    .label {
      display: inline-block;
      width: 100%;
      box-sizing: border-box;
      padding: 5px;
      font-size: 12px;
      font-weight: 500;
      font-family: Monaco, monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background: rgb(var(--label-bg));
      border-radius: 0 0 var(--border-radius) var(--border-radius);
    }
    [aria-label] {
      cursor: pointer;
      position: relative;
    }
    [aria-label]::after {
      width: 120px;
      background-color: rgba(28, 28, 30, 0.9);
      border-radius: 5px;
      border: .5px solid rgba(28, 28, 30, 1);
      margin-bottom: 16px;
      box-shadow: 0 0 .1875rem rgba(0, 0, 0, .3);
      color: #f0f0f0;
      content: attr(aria-label);
      font-size: 12px;
      line-height: 1;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-style: normal;
      font-weight: 500;
      padding: 10px;
      text-indent: 0;
      text-shadow: none;
      white-space: nowrap;
      z-index: 50;
    }
    [aria-label]::before {
      content: "";
      z-index: 49;
      border: 8px solid transparent;
      border-top-color: rgba(28, 28, 30, 1);
      height: 0;
      width: 0;
      display: block;
    }
    [aria-label]::after,
    [aria-label]::before {
      bottom: 100%;
      box-sizing: border-box;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      transition: all .2s ease-in-out 0s;
      transition-delay: 0s;
      left: 50%;
      transform: translate(-50%, 10px);
      transform-origin: top;
    }
    [aria-label]:hover::after,
    [aria-label]:hover::before {
      opacity: 1;
      transform: translate(-50%, 4px);
    }

    dialog {
      width: 500px;
      padding: 0;
      color: white;
      border: 1px solid rgba(255 255 255 / 0.1);
      background-color: rgb(var(--preview-bg) / 0.9);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      backdrop-filter: saturate(180%) blur(20px);
      box-shadow: 0 0 2px 1px rgb(0 0 0 / .1);
      border-radius: var(--border-radius);
      animation: fade-out 0.2s ease-out;
      z-index: 5000;
      overflow: visible;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
    }
    dialog[open] {
      animation: fade-in 0.2s ease-out;
    }
    dialog[open]::backdrop {
      animation: backdrop-fade-in 0.2s ease-out forwards;
    }
    dialog .header {
      margin: 0;
      padding: 10px 15px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    dialog .header .close {
      left: 10px;
      top: -3px;
      width: 30px;
      height: 30px;
      font-size: 20px;
      color: white;
      background: transparent;
      border: none;
      border-radius: 50%;
      position: relative;
      cursor: pointer;
    }
    dialog .content {
      padding: 0 15px 10px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    dialog .content .cell-1 {
      width: 160px;
      height: 80px;
      padding: 40px 0;
    }
    dialog .content .cell-1 .icon {
      display: block;
    }
    dialog .content .cell-2 {
      width: calc(100% - 180px);
      position: relative;
    }
    dialog .content .cell-2 .copy {
      right: 8px;
      top: 8px;
      padding: 0;
      color: rgb(255 255 255 / 0.7);
      background: transparent;
      border: none;
      position: absolute;
    }
    dialog .content .cell-2 .copy:hover {
      color: rgb(255 255 255 / 1);
    }
    dialog .content .cell-2 .example {
      min-height: 80px;
      padding: 32px 20px 18px;
      border-radius: 6px;
      border: 1px solid rgb(255 255 255 / 0.2);
      background: rgb(10 10 10);
      overflow-x: auto;
      box-sizing: border-box;
    }
    dialog .content .cell-2 code {
      font-size: 13px;
      white-space: nowrap;
       user-select: text;
      -moz-user-select: text;
      -webkit-user-select: text;
    }
    dialog .content .cell-3 {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: start;
    }
    dialog .content .cell-3 .caption {
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      text-align: start;
    }
    dialog .content .cell-3 .buttons {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      column-gap: 4px;
    }
    dialog .content .cell-3 .buttons button {
      height: 22px;
      margin-bottom: 4px;
      padding: 2px 6px;
      font-size: 12px;
      line-height: 1;
      color: white;
      background-color: rgba(255 255 255 / 0.1);
      border: none;
      border-radius: 3px;
      display: inline-block;
      cursor: pointer;
    }
    dialog .content .cell-3 .buttons button.active {
      background-color: rgb(var(--label-bg));
    }
    
    dialog ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
      transition: all .15s ease-in-out;
    }
    dialog ::-webkit-scrollbar-track {
      padding: 4px 0;
      position: relative;
      background-color: transparent;
    }
    dialog ::-webkit-scrollbar-button {
      height: 8px;
      background-color: transparent;
    }
    dialog ::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: rgb(255 255 255 / 0.5);
    }
    dialog ::-webkit-scrollbar-corner {
      display: none;
    }

    @keyframes fade-in {
      0% {
        opacity: 0;
        transform: translateY(-20px);
        display: none;
      }

      100% {
        opacity: 1;
        transform: translateY(0);
        display: block;
      }
    }
    @keyframes fade-out {
      0% {
        opacity: 1;
        transform: translateY(0);
        display: block;
      }

      100% {
        opacity: 0;
        transform: translateY(-20px);
        display: none;
      }
    }
    @keyframes backdrop-fade-in {
      0% {
        background-color: rgb(0 0 0 / 0%);
      }

      100% {
        background-color: rgb(0 0 0 / 25%);
      }
    }
  </style>

  <link rel="stylesheet" type="text/css" href="/style.css"/>

  <script type="application/javascript">
    let activeAnimationButton; 
    let prefix;    
    function renderExample() {
      const iconDemo = document.getElementById('icon-demo');
      const code = document.getElementById('code-example');
      const className = iconDemo.className.replace(' icon-5x', '');
      
      code.dataset.source = '<i class="' + className + '"></i>';
      let html = '<span style="color: #D5B778">&#60;i </span>';
      html += '<span style="color: #BABABA">class=</span>';
      html += '<span style="color: #6AAB73">&#34;' + className + '&#34;</span>';
      html += '<span style="color: #D5B778">&#62;&#60;/i&#62;</span>';
      
      code.innerHTML = html;
    }
    function onChooseIcon(button) {
      const dialog = document.getElementById('icon-dialog');
      const header = document.getElementById('dialog-header');
      const iconDemo = document.getElementById('icon-demo');

      prefix = button.dataset.prefix;
      header.innerText = button.dataset.name;
      iconDemo.className = button.dataset.prefix + ' ' + button.dataset.class + ' icon-5x';

      renderExample();
      
      dialog.showModal();
    }
    function onClose() {
      const dialog = document.getElementById('icon-dialog');
      dialog.close();
     
      if (activeAnimationButton) {
        activeAnimationButton.classList.remove('active');
        activeAnimationButton = undefined;
      }
    }
    function onAnimationClick(button) {
      const iconDemo = document.getElementById('icon-demo');
      
      const toDisable = button.classList.contains('active');
      
      if (activeAnimationButton) {
        activeAnimationButton.classList.remove('active');
        iconDemo.classList.remove(prefix + '-' + activeAnimationButton.dataset.animation);
        activeAnimationButton = undefined;
      }
      
      if (toDisable) {
        renderExample();
        return;
      }
      
      button.classList.add('active')
      iconDemo.classList.add(prefix + '-' + button.dataset.animation);
      activeAnimationButton = button;
      
      renderExample();
    }
    function onCopy(button) {
      const code = document.getElementById('code-example');
      navigator.clipboard.writeText(code.dataset.source).then(() => {
        const label = button.getAttribute('aria-label');
        button.setAttribute('aria-label', 'Copied ✔');

        let timeout;
        const back = () => {
          clearTimeout(timeout);
          button.removeEventListener('mouseout', back);
          setTimeout(() => button.setAttribute('aria-label', label), 200);
        };

        timeout = setTimeout(() => button.setAttribute('aria-label', label), 5000);
        button.addEventListener('mouseout', back);
      });
    }
  </script>

  <script type="application/javascript">
    let health = 'unknown';
    async function checkHealth() {
      try {
        const res = await fetch('/healthcheck', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          health = 'failed';
        }

        const data = await res.json();
        // Reload by server command
        if (data.status === 'reload') {
          return window.location.reload(true);
        } 
        // If "ok" after failed then reload. 
        else if (data.status === 'ok') {
          if (health === 'failed') {
            return window.location.reload(true);
          } else {
            health = 'healthy';
          }
        }
      } catch {
        health = 'failed';
      }
    }

    setInterval(checkHealth, 1000);
  </script>
</head>
`;

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

export class TransformToHtml extends Transform {

  private readonly _fontName: string;

  private readonly _prefix: string;

  private _isHeaderRendered = false;

  constructor(fontName: string, prefix: string) {
    super({ objectMode: true });

    this._fontName = fontName;
    this._prefix = prefix;
  }

  private _header(): string {
    let output = '<!DOCTYPE html>\n';
    output += '<html lang="en">\n';
    output += HEAD.replace('{{caption}}', this._fontName);
    output += '<body>\n';
    output += `<h1 class="caption">\n`;
    output += BRAND + '\n';
    output += `</h1>\n`;

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

