import { SVGPathDataParser, SVGPathData } from 'svg-pathdata';
import type { SVGCommand } from 'svg-pathdata/src/types.js';
import { SYMBOL_SIZE } from './constants.js';

function computeBoundaries(svg: string): { x: number; y: number; width: number; height: number } {
  const root = svg.split('<svg')[1].split('>')?.[0] as string;
  if (!root) {
    throw new Error('NOT_SVG');
  }

  const matchedWidth = root.match(/width=["'](\d+)["']/)?.[1];
  const matchedHeight = root.match(/height=["'](\d+)["']/)?.[1];
  const viewBox = root.match(/viewBox=["'](-?\d+)\s(-?\d+)\s(\d+)\s(\d+)["']/);
  let x = 0;
  let y = 0;
  let width = SYMBOL_SIZE;
  let height = SYMBOL_SIZE;
  if (viewBox) {
    x = parseFloat(viewBox[1]);
    y = parseFloat(viewBox[2]);
    width = parseFloat(viewBox[3]);
    height = parseFloat(viewBox[4]);
  }
  if (matchedWidth) {
    width = parseFloat(matchedWidth);
  }
  if (matchedHeight) {
    height = parseFloat(matchedHeight);
  }

  return { x, y, width, height };
}

export function parseSvg(svg: string): string | null {
  const boundary = computeBoundaries(svg);
  const [_p, ...partials] = svg.split('<path');
  if (partials.length === 0) {
    return null;
  }

  const commands: SVGCommand[] = [];
  const parser = new SVGPathDataParser();

  for (let part of partials) {
    [, part] = part.split(' d="');
    [part] = part.split('"');

    parser.parse(part, commands)
  }
  parser.finish(commands);

  const path = new SVGPathData(commands)
    .translate(-boundary.x, -boundary.y)
    .scale(SYMBOL_SIZE / boundary.width, SYMBOL_SIZE / boundary.height)

  return path.toAbs().scale(1, -1).encode();
}