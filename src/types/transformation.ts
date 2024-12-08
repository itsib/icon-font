import { SVGCommand } from 'svg-pathdata';

export type TransformFunction = (command: SVGCommand) => SVGCommand | SVGCommand[];

export interface SvgTransformation {
  attribute: string;
  function: TransformFunction;
}