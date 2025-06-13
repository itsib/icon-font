import { Transform, TransformCallback } from 'node:stream';
import { BufferWithMeta, SymbolMetadata, FontType } from '../../types';
import { encodeCss } from '../../utils/coders.ts';
import { fontFace } from '../../utils/font-face.ts';

const STYLES = `
.{{prefix}} {
  font-family: "{{fontName}}";
  font-weight: 400;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: var(--{{prefix}}-display, inline-block);
  font-style: normal;
  font-variant: normal;
  line-height: 1;
  text-rendering: auto;
}

.{{prefix}}-1x {
  font-size: 1em
}
.{{prefix}}-2x {
  font-size: 2em
}
.{{prefix}}-3x {
  font-size: 3em
}
.{{prefix}}-4x {
  font-size: 4em
}
.{{prefix}}-5x {
  font-size: 5em
}
.{{prefix}}-6x {
  font-size: 6em
}
.{{prefix}}-7x {
  font-size: 7em
}
.{{prefix}}-8x {
  font-size: 8em
}
.{{prefix}}-9x {
  font-size: 9em
}
.{{prefix}}-10x {
  font-size: 10em
}
.{{prefix}}-2xs {
  font-size: .625em;
}
.{{prefix}}-xs {
  font-size: .75em;
}
.{{prefix}}-sm {
  font-size: .875em;
}
.{{prefix}}-lg {
  font-size: 1.25em;
}
.{{prefix}}-xl {
  font-size: 1.5em;
}
.{{prefix}}-2xl {
  font-size: 2em;
}
.{{prefix}}-3xl {
  font-size: 2.5em;
}
.{{prefix}}-fw {
  text-align: center;
  width: 1.25em
}

.{{prefix}}-beat {
  animation-name: icon-motion-beat;
  animation-delay: var(--{{prefix}}-animation-delay, 0s);
  animation-direction: var(--{{prefix}}-animation-direction, normal);
  animation-duration: var(--{{prefix}}-animation-duration, 1s);
  animation-iteration-count: var(--{{prefix}}-animation-iteration-count, infinite);
  animation-timing-function: var(--{{prefix}}-animation-timing, ease-in-out)
}

.{{prefix}}-bounce {
  animation-name: icon-motion-bounce;
  animation-delay: var(--{{prefix}}-animation-delay, 0s);
  animation-direction: var(--{{prefix}}-animation-direction, normal);
  animation-duration: var(--{{prefix}}-animation-duration, 1s);
  animation-iteration-count: var(--{{prefix}}-animation-iteration-count, infinite);
  animation-timing-function: var(--{{prefix}}-animation-timing, cubic-bezier(.28,.84,.42,1));
}

.{{prefix}}-fade {
  animation-name: icon-motion-fade;
  animation-iteration-count: var(--{{prefix}}-animation-iteration-count, infinite);
  animation-timing-function: var(--{{prefix}}-animation-timing, cubic-bezier(.4,0,.6,1));
}

.{{prefix}}-beat-fade,
.{{prefix}}-fade {
  animation-delay: var(--{{prefix}}-animation-delay,0s);
  animation-direction: var(--{{prefix}}-animation-direction,normal);
  animation-duration: var(--{{prefix}}-animation-duration,1s);
}

.{{prefix}}-beat-fade {
  animation-name: icon-motion-beat-fade;
  animation-iteration-count: var(--{{prefix}}-animation-iteration-count,infinite);
  animation-timing-function: var(--{{prefix}}-animation-timing,cubic-bezier(.4,0,.6,1));
}

.{{prefix}}-flip {
  animation-name: icon-motion-flip;
  animation-delay: var(--{{prefix}}-animation-delay,0s);
  animation-direction: var(--{{prefix}}-animation-direction,normal);
  animation-duration: var(--{{prefix}}-animation-duration,1s);
  animation-iteration-count: var(--{{prefix}}-animation-iteration-count,infinite);
  animation-timing-function: var(--{{prefix}}-animation-timing,ease-in-out);
}

.{{prefix}}-shake {
  animation-name: icon-motion-shake;
  animation-duration: var(--{{prefix}}-animation-duration,1s);
  animation-iteration-count: var(--{{prefix}}-animation-iteration-count,infinite);
  animation-timing-function: var(--{{prefix}}-animation-timing,linear);
}

.{{prefix}}-spin-reverse {
  --{{prefix}}-animation-direction: reverse;
}

.{{prefix}}-shake,
.{{prefix}}-spin-reverse,
.{{prefix}}-spin {
  animation-delay: var(--{{prefix}}-animation-delay,0s);
  animation-direction: var(--{{prefix}}-animation-direction,normal);
}

.{{prefix}}-spin-reverse,
.{{prefix}}-spin {
  animation-name: icon-motion-spin;
  animation-duration: var(--{{prefix}}-animation-duration,2s);
  animation-iteration-count: var(--{{prefix}}-animation-iteration-count,infinite);
  animation-timing-function: var(--{{prefix}}-animation-timing,linear);
}


.{{prefix}}-pulse,
.{{prefix}}-spin-pulse {
  animation-name: icon-motion-spin;
  animation-direction: var(--{{prefix}}-animation-direction, normal);
  animation-duration: var(--{{prefix}}-animation-duration, 1s);
  animation-iteration-count: var(--{{prefix}}-animation-iteration-count, infinite);
  animation-timing-function: var(--{{prefix}}-animation-timing, steps(8));
}

@media (prefers-reduced-motion:reduce) {
  .{{prefix}}-beat, 
  .{{prefix}}-beat-fade, 
  .{{prefix}}-bounce, 
  .{{prefix}}-fade, 
  .{{prefix}}-flip, 
  .{{prefix}}-pulse, 
  .{{prefix}}-shake, 
  .{{prefix}}-spin-reverse, 
  .{{prefix}}-spin, 
  .{{prefix}}-spin-pulse {
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
    transform: scale(var(--{{prefix}}-beat-scale,1.25))
  }
}

@keyframes icon-motion-bounce {
  0% {
    transform: scale(1) translateY(0)
  }

  10% {
    transform: scale(var(--{{prefix}}-bounce-start-scale-x,1.1),var(--{{prefix}}-bounce-start-scale-y,.9)) translateY(0)
  }

  30% {
    transform: scale(var(--{{prefix}}-bounce-jump-scale-x,.9),var(--{{prefix}}-bounce-jump-scale-y,1.1)) translateY(var(--{{prefix}}-bounce-height,-.5em))
  }

  50% {
    transform: scale(var(--{{prefix}}-bounce-land-scale-x,1.05),var(--{{prefix}}-bounce-land-scale-y,.95)) translateY(0)
  }

  57% {
    transform: scale(1) translateY(var(--{{prefix}}-bounce-rebound,-.125em))
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
    opacity: var(--{{prefix}}-fade-opacity,.4)
  }
}

@keyframes icon-motion-beat-fade {
  0%,to {
    opacity: var(--{{prefix}}-beat-fade-opacity,.4);
    transform: scale(1)
  }

  50% {
    opacity: 1;
    transform: scale(var(--{{prefix}}-beat-fade-scale,1.125))
  }
}

@keyframes icon-motion-flip {
  50% {
    transform: rotate3d(var(--{{prefix}}-flip-x,0),var(--{{prefix}}-flip-y,1),var(--{{prefix}}-flip-z,0),var(--{{prefix}}-flip-angle,-180deg))
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

  private readonly _fontName: string;

  private readonly _types: FontType[];

  private readonly _prefix: string;

  private readonly _url: string;

  private readonly _hash?: string;

  private _isHeaderRendered = false;

  constructor(fontName: string, types: FontType[], prefix: string, url: string, fontUrlHash: string | 'random' | false) {
    super({ objectMode: true });

    this._fontName = fontName;
    this._types = types;
    this._prefix = prefix;
    this._url = url;
    if (fontUrlHash === 'random') {
      this._hash = Math.round(Math.random() * 10000000).toString();
    } else if (fontUrlHash) {
      this._hash = fontUrlHash;
    }

  }

  private _header() {
    let output = fontFace(this._url, this._fontName, this._types, this._hash);

    output += STYLES.replace('{{fontName}}', this._fontName).replace(/\{\{prefix}}/g, this._prefix) + '\n';

    return output;
  }

  _transform(chunk: BufferWithMeta<SymbolMetadata>, _encoding: BufferEncoding, callback: TransformCallback) {
    let output = '';
    if (!this._isHeaderRendered) {
      output += this._header();
      this._isHeaderRendered = true;
    }

    output += `i.${this._prefix}-${chunk.metadata.name}:before {\n`;
    output += `  content: "${encodeCss([chunk.metadata.codepoint])}";\n`;
    output += '}\n\n';

    callback(null, output);
  }
}