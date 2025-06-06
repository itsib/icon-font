import { AppConfig, IconTune } from './types';
import { pipeline, Writable, Readable } from 'node:stream';
import { StreamReadIconFiles } from './streams/stream-read-icon-files/stream-read-icon-files.ts';
import { TransformToCss } from './streams/transform-to-css/transform-to-css.ts';
import { TransformPrepareIcons } from './streams/transform-prepare-icons/transform-prepare-icons.ts';
import { TransformToTtf } from './streams/transform-to-ttf/transform-to-ttf.ts';
import { TransformTtfToWoff2 } from './streams/transform-ttf-to-woff2/transform-ttf-to-woff2.ts';
import { TransformTtfToWoff } from './streams/transform-ttf-to-woff/transform-ttf-to-woff.ts';
import { TransformTtfToEot } from './streams/transform-ttf-to-eot/transform-ttf-to-eot.ts';
import { TransformToSvg } from './streams/transform-to-svg/transform-to-svg.ts';

export interface Callback {
  (error: Error | null): void;
}

export type IconsTune = AppConfig['iconsTune'];

export type { AppConfig, IconTune }

export interface CompileFn {
  (name: string, src: Readable, dst: Writable, tune?: IconsTune, callback?: Callback): void
  (name: string, src: Readable, dst: Writable, callback?: Callback): void
}

export interface CompileCssFn {
  (config: AppConfig, src: Readable, dst: Writable, callback?: Callback): void
}

const fakeCallback = (() => {}) as Callback;

const resolveRest = (...rest: (IconsTune | Callback | undefined)[]): { callback: Callback, iconsTune: IconsTune } => {
  if (rest.length === 0) {
    return {
      callback: fakeCallback,
      iconsTune: {} as IconsTune,
    }
  } else if (typeof rest[0] === 'function') {
    return {
      callback: rest[0] as Callback,
      iconsTune: {} as IconsTune,
    }
  } else {
    return {
      callback: (rest[1] || fakeCallback) as Callback,
      iconsTune: (rest[0] || {}) as IconsTune,
    }
  }
}

export const compileWoff2: CompileFn = (name, src, dst, ...rest: (IconsTune | Callback | undefined)[]) => {
  const { callback, iconsTune } = resolveRest(...rest);

  pipeline(
    src,
    new TransformPrepareIcons(iconsTune),
    new TransformToTtf(name),
    new TransformTtfToWoff2(),
    dst,
    callback,
  )
}

export const compileWoff: CompileFn = (name, src, dst, ...rest: (IconsTune | Callback | undefined)[]) => {
  const { callback, iconsTune } = resolveRest(...rest);

  pipeline(
    src,
    new TransformPrepareIcons(iconsTune),
    new TransformToTtf(name),
    new TransformTtfToWoff(),
    dst,
    callback,
  )
}

export const compileEot: CompileFn = (name, src, dst, ...rest: (IconsTune | Callback | undefined)[]) => {
  const { callback, iconsTune } = resolveRest(...rest);

  pipeline(
    src,
    new TransformPrepareIcons(iconsTune),
    new TransformToTtf(name),
    new TransformTtfToEot(),
    dst,
    callback,
  )
}

export const compileTtf: CompileFn = (name, src, dst, ...rest: (IconsTune | Callback | undefined)[]) => {
  const { callback, iconsTune } = resolveRest(...rest);

  pipeline(
    src,
    new TransformPrepareIcons(iconsTune),
    new TransformToTtf(name),
    dst,
    callback,
  )
}

export const compileSvg: CompileFn = (name, src, dst, ...rest: (IconsTune | Callback | undefined)[]) => {
  const { callback, iconsTune } = resolveRest(...rest);

  pipeline(
    src,
    new TransformPrepareIcons(iconsTune),
    new TransformToSvg(name),
    dst,
    callback,
  )
}

export const compileCss: CompileCssFn = (config, src, dst, callback?: Callback) => {
  pipeline(
    src,
    new TransformPrepareIcons(config.iconsTune),
    new TransformToCss(config.name, config.types, config.prefix, config.fontUrl, config.fontUrlHash),
    dst,
    callback || (() => {}),
  )
}

export { StreamReadIconFiles }
