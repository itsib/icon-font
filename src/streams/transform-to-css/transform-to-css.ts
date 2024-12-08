import { Transform, TransformCallback } from 'node:stream';
import { BufferWithMeta, SymbolMeta } from '../../types/types.ts';
import { FontType } from '../../types';
import { slugify } from '../../utils/slugify.ts';
import { join } from 'node:path';
import { encodeHtml } from '../../utils/coders.ts';

const STYLES = `
.icon {
  font-family: "{{fontName}}", sans-serif;
  font-weight: 500;
  font-size: 1rem;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
  display: var(--icon-display, inline-block);
  speak: none;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
}

.icon-1x {
  font-size: 1em
}
.icon-2x {
  font-size: 2em
}
.icon-3x {
  font-size: 3em
}
.icon-4x {
  font-size: 4em
}
.icon-5x {
  font-size: 5em
}
.icon-6x {
  font-size: 6em
}
.icon-7x {
  font-size: 7em
}
.icon-8x {
  font-size: 8em
}
.icon-9x {
  font-size: 9em
}
.icon-10x {
  font-size: 10em
}
.icon-2xs {
  font-size: .625em;
  line-height: .1em;
  vertical-align: .225em
}
.icon-xs {
  font-size: .75em;
  line-height: .08333em;
  vertical-align: .125em
}
.icon-sm {
  font-size: .875em;
  line-height: .07143em;
  vertical-align: .05357em
}
.icon-lg {
  font-size: 1.25em;
  line-height: .05em;
  vertical-align: -.075em
}
.icon-xl {
  font-size: 1.5em;
  line-height: .04167em;
  vertical-align: -.125em
}
.icon-2xl {
  font-size: 2em;
  line-height: .03125em;
  vertical-align: -.1875em
}
.icon-fw {
  text-align: center;
  width: 1.25em
}

.icon-beat {
  animation-name: icon-motion-beat;
  animation-delay: var(--icon-animation-delay, 0s);
  animation-direction: var(--icon-animation-direction, normal);
  animation-duration: var(--icon-animation-duration, 1s);
  animation-iteration-count: var(--icon-animation-iteration-count, infinite);
  animation-timing-function: var(--icon-animation-timing, ease-in-out)
}

.icon-bounce {
  animation-name: icon-motion-bounce;
  animation-delay: var(--icon-animation-delay, 0s);
  animation-direction: var(--icon-animation-direction, normal);
  animation-duration: var(--icon-animation-duration, 1s);
  animation-iteration-count: var(--icon-animation-iteration-count, infinite);
  animation-timing-function: var(--icon-animation-timing, cubic-bezier(.28,.84,.42,1));
}

.icon-fade {
  animation-name: icon-motion-fade;
  animation-iteration-count: var(--icon-animation-iteration-count, infinite);
  animation-timing-function: var(--icon-animation-timing, cubic-bezier(.4,0,.6,1));
}

.icon-beat-fade,
.icon-fade {
  animation-delay: var(--icon-animation-delay,0s);
  animation-direction: var(--icon-animation-direction,normal);
  animation-duration: var(--icon-animation-duration,1s);
}

.icon-beat-fade {
  animation-name: icon-motion-beat-fade;
  animation-iteration-count: var(--icon-animation-iteration-count,infinite);
  animation-timing-function: var(--icon-animation-timing,cubic-bezier(.4,0,.6,1));
}

.icon-flip {
  animation-name: icon-motion-flip;
  animation-delay: var(--icon-animation-delay,0s);
  animation-direction: var(--icon-animation-direction,normal);
  animation-duration: var(--icon-animation-duration,1s);
  animation-iteration-count: var(--icon-animation-iteration-count,infinite);
  animation-timing-function: var(--icon-animation-timing,ease-in-out);
}

.icon-shake {
  animation-name: icon-motion-shake;
  animation-duration: var(--icon-animation-duration,1s);
  animation-iteration-count: var(--icon-animation-iteration-count,infinite);
  animation-timing-function: var(--icon-animation-timing,linear);
}

.icon-shake,
.icon-spin {
  animation-delay: var(--icon-animation-delay,0s);
  animation-direction: var(--icon-animation-direction,normal);
}

.icon-spin {
  animation-name: icon-motion-spin;
  animation-duration: var(--icon-animation-duration,2s);
  animation-iteration-count: var(--icon-animation-iteration-count,infinite);
  animation-timing-function: var(--icon-animation-timing,linear);
}

.icon-spin-reverse {
  --icon-animation-direction: reverse;
}

.icon-pulse,
.icon-spin-pulse {
  animation-name: icon-motion-spin;
  animation-direction: var(--icon-animation-direction, normal);
  animation-duration: var(--icon-animation-duration, 1s);
  animation-iteration-count: var(--icon-animation-iteration-count, infinite);
  animation-timing-function: var(--icon-animation-timing, steps(8));
}

@media (prefers-reduced-motion:reduce) {
  .icon-beat, .icon-beat-fade, .icon-bounce, .icon-fade, .icon-flip, .icon-pulse, .icon-shake, .icon-spin, .icon-spin-pulse {
    animation-delay: -1ms;
    animation-duration: 1ms;
    animation-iteration-count: 1;
    transition-delay: 0s;
    transition-duration: 0s
  }
}

@keyframes icon-motion-beat {
  0%,90% {
    transform: scale(1)
  }

  45% {
    transform: scale(var(--icon-beat-scale,1.25))
  }
}

@keyframes icon-motion-bounce {
  0% {
    transform: scale(1) translateY(0)
  }

  10% {
    transform: scale(var(--icon-bounce-start-scale-x,1.1),var(--icon-bounce-start-scale-y,.9)) translateY(0)
  }

  30% {
    transform: scale(var(--icon-bounce-jump-scale-x,.9),var(--icon-bounce-jump-scale-y,1.1)) translateY(var(--icon-bounce-height,-.5em))
  }

  50% {
    transform: scale(var(--icon-bounce-land-scale-x,1.05),var(--icon-bounce-land-scale-y,.95)) translateY(0)
  }

  57% {
    transform: scale(1) translateY(var(--icon-bounce-rebound,-.125em))
  }

  64% {
    transform: scale(1) translateY(0)
  }

  to {
    transform: scale(1) translateY(0)
  }
}

@keyframes icon-motion-fade {
  50% {
    opacity: var(--icon-fade-opacity,.4)
  }
}

@keyframes icon-motion-beat-fade {
  0%,to {
    opacity: var(--icon-beat-fade-opacity,.4);
    transform: scale(1)
  }

  50% {
    opacity: 1;
    transform: scale(var(--icon-beat-fade-scale,1.125))
  }
}

@keyframes icon-motion-flip {
  50% {
    transform: rotate3d(var(--icon-flip-x,0),var(--icon-flip-y,1),var(--icon-flip-z,0),var(--icon-flip-angle,-180deg))
  }
}

@keyframes icon-motion-shake {
  0% {
    transform: rotate(-15deg)
  }

  4% {
    transform: rotate(15deg)
  }

  8%,24% {
    transform: rotate(-18deg)
  }

  12%,28% {
    transform: rotate(18deg)
  }

  16% {
    transform: rotate(-22deg)
  }

  20% {
    transform: rotate(22deg)
  }

  32% {
    transform: rotate(-12deg)
  }

  36% {
    transform: rotate(12deg)
  }

  40%,to {
    transform: rotate(0deg)
  }
}

@keyframes icon-motion-spin {
  0% {
    transform: rotate(0deg)
  }

  to {
    transform: rotate(1turn)
  }
}
`

export class TransformToCss extends Transform {

  private readonly _fontId: string;

  private readonly _fontName: string;

  private readonly _types: FontType[];

  private readonly _prefix: string;

  private readonly _url: string;

  private _isHeaderRendered = false;

  constructor(fontName: string, types: FontType[], prefix = 'icon', url = '/') {
    super({ objectMode: true });

    this._fontId = slugify(fontName);
    this._fontName = fontName;
    this._types = types;
    this._prefix = prefix;
    this._url = url;
  }

  private _fontFaceUrl(type: FontType): string {
    const fontUrl = join(this._url, `${this._fontId}.${type}`);
    switch (type) {
      case 'eot':
        return `url("${fontUrl}#iefix") format("embedded-opentype")`;
      case 'woff2':
        return `url("${fontUrl}") format("woff2")`;
      case 'woff':
        return `url("${fontUrl}") format("woff")`;
      case 'ttf':
        return `url("${fontUrl}") format("truetype")`;
      case 'svg':
        return `url("${fontUrl}") format("svg")`;
      default:
        throw new Error(`Unsupported type "${type}"`);
    }
  }

  private _header() {
    let output = '@font-face {\n'
    output += `  font-family: "${this._fontName}";\n`;
    output += '  src: ';

    for (let i = 0; i < this._types.length; i++) {
      const type = this._types[i];
      const fontUrl = this._fontFaceUrl(type);
      output += i === 0 ? fontUrl : `     ${fontUrl}`;
      output += i === this._types.length - 1 ? ';\n' : ',\n';
    }
    output += '}\n';

    output += STYLES.replace('{{fontName}}', this._fontName) + '\n';

    return output;
  }

  _transform(chunk: BufferWithMeta<SymbolMeta>, _encoding: BufferEncoding, callback: TransformCallback) {
    let output = '';
    if (!this._isHeaderRendered) {
      output += this._header();
      this._isHeaderRendered = true;
    }

    output += `i.${this._prefix}-${chunk.metadata.name}:before {\n`;
    output += `  content: "\\${encodeHtml([chunk.metadata.codepoint])}";\n`;
    output += '}\n\n';

    callback(null, output);
  }
}