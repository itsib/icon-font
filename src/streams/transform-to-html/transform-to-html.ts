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
      --preview-bg: rgba(2, 6, 23, 0.7);
      --label-bg: #0c4a6e;

      color: #e2e8f0;
      background: #0f172a;
    }
    body {
      font-family: "Ubuntu Sans", Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
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
      background: var(--preview-bg);
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
      font-size: 11px;
      font-family: Monaco, monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background: var(--label-bg);
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
  </style>

  <link rel="stylesheet" type="text/css" href="/style.css"/>

  <script type="application/javascript">
    function onClickCallback(button) {
      navigator.clipboard.writeText(button.dataset.text).then(() => {
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

    return output;
  }

  _transform(chunk: BufferWithMeta<SymbolMeta>, _encoding: BufferEncoding, callback: TransformCallback) {
    const size = Math.max(chunk.metadata.width, chunk.metadata.height);
    let output = '';
    if (!this._isHeaderRendered) {
      output += this._header();
      this._isHeaderRendered = true;
    }

    output += `
<button type="button" class="preview" data-text="${this._prefix} ${this._prefix}-${chunk.metadata.name}" aria-label="Copy to clipboard" onclick="onClickCallback(this)">
  <span class="inner">
    <i class="${this._prefix} ${this._prefix}-${chunk.metadata.name}"></i>
  </span>
  <br>
  <span class="label">${chunk.metadata.name}</span>
</button>`

    callback(null, output);
  }

  _flush(callback: TransformCallback) {
    callback(null, '</div>\n</body>\n</html>');
  }
}