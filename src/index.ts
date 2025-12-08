import type { IconsTune, FontType } from './types';
import { StreamReadIconFiles } from './streams/stream-read-icon-files/stream-read-icon-files.ts';
import { TransformToCss } from './streams/transform-to-css/transform-to-css.ts';
import { TransformPrepareIcons } from './streams/transform-prepare-icons/transform-prepare-icons.ts';
import { TransformToTtf } from './streams/transform-to-ttf/transform-to-ttf.ts';
import { TransformTtfToWoff2 } from './streams/transform-ttf-to-woff2/transform-ttf-to-woff2.ts';
import { TransformTtfToWoff } from './streams/transform-ttf-to-woff/transform-ttf-to-woff.ts';
import { TransformTtfToEot } from './streams/transform-ttf-to-eot/transform-ttf-to-eot.ts';
import { TransformToSvg } from './streams/transform-to-svg/transform-to-svg.ts';
export * from './server/middlewares';
export * from './server/server';
export * from './types/app-config'

export const read = (basePath: string, filenames?: string[]) => {
  return new StreamReadIconFiles(basePath, filenames)
}

export const prepare = (iconsTune?: IconsTune, shapeSizeAdjust?: number, startUnicode?: number, disableAutoalign?: boolean) =>  {
  return new TransformPrepareIcons(iconsTune, shapeSizeAdjust, startUnicode, disableAutoalign);
}

export const toTtf = (name: string, baselineOffset?: number) => {
  return new TransformToTtf({ fontName: name, baselineOffset  });
}

export const ttfToWoff = () => {
  return new TransformTtfToWoff();
}

export const ttfToWoff2 = () => {
  return new TransformTtfToWoff2();
}

export const ttfToEot = () => {
  return new TransformTtfToEot()
}

export const toSvg = (name: string) => {
  return new TransformToSvg(name)
}

export const toCss = (name: string, types: FontType[], prefix: string, url: string, fontUrlHash: string | 'random' | false) => {
  return new TransformToCss(name, types, prefix, url, fontUrlHash)
}
