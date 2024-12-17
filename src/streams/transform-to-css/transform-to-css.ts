import { Transform, TransformCallback } from 'node:stream';
import { BufferWithMeta, SymbolMeta } from '../../types/types.ts';
import { FontType } from '../../types';
import { encodeCss } from '../../utils/coders.ts';
import { fontFace } from '../../utils/font-face.ts';

const STYLES = `
.{{prefix}} {
  font-family: "{{fontName}}", sans-serif;
  font-weight: 500;
  font-size: 1em;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
  display: var(--icon-display, inline-block);
  speak: none;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
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
  line-height: .1em;
  vertical-align: .225em
}
.{{prefix}}-xs {
  font-size: .75em;
  line-height: .08333em;
  vertical-align: .125em
}
.{{prefix}}-sm {
  font-size: .875em;
  line-height: .07143em;
  vertical-align: .05357em
}
.{{prefix}}-lg {
  font-size: 1.25em;
  line-height: .05em;
  vertical-align: -.075em
}
.{{prefix}}-xl {
  font-size: 1.5em;
  line-height: .04167em;
  vertical-align: -.125em
}
.{{prefix}}-2xl {
  font-size: 2em;
  line-height: .03125em;
  vertical-align: -.1875em
}
.{{prefix}}-fw {
  text-align: center;
  width: 1.25em
}

.{{prefix}}-beat {
  animation-name: icon-motion-beat;
  animation-delay: var(--icon-animation-delay, 0s);
  animation-direction: var(--icon-animation-direction, normal);
  animation-duration: var(--icon-animation-duration, 1s);
  animation-iteration-count: var(--icon-animation-iteration-count, infinite);
  animation-timing-function: var(--icon-animation-timing, ease-in-out)
}

.{{prefix}}-bounce {
  animation-name: icon-motion-bounce;
  animation-delay: var(--icon-animation-delay, 0s);
  animation-direction: var(--icon-animation-direction, normal);
  animation-duration: var(--icon-animation-duration, 1s);
  animation-iteration-count: var(--icon-animation-iteration-count, infinite);
  animation-timing-function: var(--icon-animation-timing, cubic-bezier(.28,.84,.42,1));
}

.{{prefix}}-fade {
  animation-name: icon-motion-fade;
  animation-iteration-count: var(--icon-animation-iteration-count, infinite);
  animation-timing-function: var(--icon-animation-timing, cubic-bezier(.4,0,.6,1));
}

.{{prefix}}-beat-fade,
.{{prefix}}-fade {
  animation-delay: var(--icon-animation-delay,0s);
  animation-direction: var(--icon-animation-direction,normal);
  animation-duration: var(--icon-animation-duration,1s);
}

.{{prefix}}-beat-fade {
  animation-name: icon-motion-beat-fade;
  animation-iteration-count: var(--icon-animation-iteration-count,infinite);
  animation-timing-function: var(--icon-animation-timing,cubic-bezier(.4,0,.6,1));
}

.{{prefix}}-flip {
  animation-name: icon-motion-flip;
  animation-delay: var(--icon-animation-delay,0s);
  animation-direction: var(--icon-animation-direction,normal);
  animation-duration: var(--icon-animation-duration,1s);
  animation-iteration-count: var(--icon-animation-iteration-count,infinite);
  animation-timing-function: var(--icon-animation-timing,ease-in-out);
}

.{{prefix}}-shake {
  animation-name: icon-motion-shake;
  animation-duration: var(--icon-animation-duration,1s);
  animation-iteration-count: var(--icon-animation-iteration-count,infinite);
  animation-timing-function: var(--icon-animation-timing,linear);
}

.{{prefix}}-spin-reverse {
  --icon-animation-direction: reverse;
}

.{{prefix}}-shake,
.{{prefix}}-spin-reverse,
.{{prefix}}-spin {
  animation-delay: var(--icon-animation-delay,0s);
  animation-direction: var(--icon-animation-direction,normal);
}

.{{prefix}}-spin-reverse,
.{{prefix}}-spin {
  animation-name: icon-motion-spin;
  animation-duration: var(--icon-animation-duration,2s);
  animation-iteration-count: var(--icon-animation-iteration-count,infinite);
  animation-timing-function: var(--icon-animation-timing,linear);
}


.{{prefix}}-pulse,
.{{prefix}}-spin-pulse {
  animation-name: icon-motion-spin;
  animation-direction: var(--icon-animation-direction, normal);
  animation-duration: var(--icon-animation-duration, 1s);
  animation-iteration-count: var(--icon-animation-iteration-count, infinite);
  animation-timing-function: var(--icon-animation-timing, steps(8));
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

  private readonly _fontName: string;

  private readonly _types: FontType[];

  private readonly _prefix: string;

  private readonly _url: string;

  private _isHeaderRendered = false;

  constructor(fontName: string, types: FontType[], prefix: string, url: string) {
    super({ objectMode: true });

    this._fontName = fontName;
    this._types = types;
    this._prefix = prefix;
    this._url = url;
  }

  private _header() {
    let output = fontFace(this._url, this._fontName, this._types);

    output += STYLES.replace('{{fontName}}', this._fontName).replace(/\{\{prefix}}/g, this._prefix) + '\n';

    return output;
  }

  _transform(chunk: BufferWithMeta<SymbolMeta>, _encoding: BufferEncoding, callback: TransformCallback) {
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