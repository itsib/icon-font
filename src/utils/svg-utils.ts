import { SVGPathData, SVGPathDataTransformer } from 'svg-pathdata';
import { SvgTransformation } from '../types.ts';
import { SHAPE_SIZE } from './constants.ts';

export interface RectAttributes {
  x?: string;
  y?: string;
  width?: string;
  height?: string;
  rx?: string;
  ry?: string;
}

export interface PolylineAttributes {
  points?: string;
}

export interface LineAttributes {
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
}

export interface CircleAttributes {
  cx?: string;
  cy?: string;
  rx?: string;
  ry?: string;
  r?: string;
}

export interface ViewBoxAttributes {
  viewBox?: string;
}

export interface TransformAttributes {
  transform?: string;
}

export function svgRectToPath(attributes: RectAttributes): string {
  const x = 'undefined' !== typeof attributes.x ? parseFloat(attributes.x) : 0;
  const y = 'undefined' !== typeof attributes.y ? parseFloat(attributes.y) : 0;
  const width =
    'undefined' !== typeof attributes.width ? parseFloat(attributes.width) : 0;
  const height =
    'undefined' !== typeof attributes.height
      ? parseFloat(attributes.height)
      : 0;
  const rx =
    'undefined' !== typeof attributes.rx
      ? parseFloat(attributes.rx)
      : 'undefined' !== typeof attributes.ry
        ? parseFloat(attributes.ry)
        : 0;
  const ry =
    'undefined' !== typeof attributes.ry ? parseFloat(attributes.ry) : rx;

  return (
    '' +
    // start at the left corner
    'M' +
    (x + rx) +
    ' ' +
    y +
    // top line
    'h' +
    (width - rx * 2) +
    // upper right corner
    (rx || ry ? 'a ' + rx + ' ' + ry + ' 0 0 1 ' + rx + ' ' + ry : '') +
    // Draw right side
    'v' +
    (height - ry * 2) +
    // Draw bottom right corner
    (rx || ry ? 'a ' + rx + ' ' + ry + ' 0 0 1 ' + rx * -1 + ' ' + ry : '') +
    // Down the down side
    'h' +
    (width - rx * 2) * -1 +
    // Draw bottom right corner
    (rx || ry
      ? 'a ' + rx + ' ' + ry + ' 0 0 1 ' + rx * -1 + ' ' + ry * -1
      : '') +
    // Down the left side
    'v' +
    (height - ry * 2) * -1 +
    // Draw bottom right corner
    (rx || ry ? 'a ' + rx + ' ' + ry + ' 0 0 1 ' + rx + ' ' + ry * -1 : '') +
    // Close path
    'z'
  );
}

export function svgPolylineToPath(attributes: PolylineAttributes): string {
  return 'M' + attributes.points;
}

export function svgLineToPath(attributes: LineAttributes): string {
  // Move to the line start
  return (
    '' +
    'M' +
    (parseFloat(attributes.x1 || '0')).toString(10) +
    ' ' +
    (parseFloat(attributes.y1 || '0')).toString(10) +
    ' ' +
    ((parseFloat(attributes.x1 || '0')) + 1).toString(10) +
    ' ' +
    ((parseFloat(attributes.y1 ||'0')) + 1).toString(10) +
    ' ' +
    ((parseFloat(attributes.x2 ||'0')) + 1).toString(10) +
    ' ' +
    ((parseFloat(attributes.y2 || '0')) + 1).toString(10) +
    ' ' +
    (parseFloat(attributes.x2 || '0')).toString(10) +
    ' ' +
    (parseFloat(attributes.y2 || '0')).toString(10) +
    'Z'
  );
}

export function svgCircleToPath(attributes: CircleAttributes): string {
  const cx = parseFloat(attributes.cx || '0');
  const cy = parseFloat(attributes.cy || '0');
  const rx =
    'undefined' !== typeof attributes.rx
      ? parseFloat(attributes.rx)
      : parseFloat(attributes.r || '0');
  const ry =
    'undefined' !== typeof attributes.ry
      ? parseFloat(attributes.ry)
      : parseFloat(attributes.r || '0');

  // use two A commands because one command which returns to origin is invalid
  return (
    '' +
    'M' +
    (cx - rx) +
    ',' +
    cy +
    'A' +
    rx +
    ',' +
    ry +
    ' 0,0,0 ' +
    (cx + rx) +
    ',' +
    cy +
    'A' +
    rx +
    ',' +
    ry +
    ' 0,0,0 ' +
    (cx - rx) +
    ',' +
    cy
  );
}

export function svgViewBoxToTransform(iconSize: number, attributes: ViewBoxAttributes): SvgTransformation[] {
  if (!attributes.viewBox) return [];

  try {
    const values = attributes.viewBox.split(/\s*,*\s|\s,*\s*|,/);

    const dX = parseFloat(values[0]) || 0;
    const dY = parseFloat(values[1]) || 0;
    const width = parseFloat(values[2]);
    const height = parseFloat(values[3]);

    const output: SvgTransformation[] = [];

    if (dX !== 0 || dY !== 0) {
      output.push({
        name: 'translate',
        attribute: `translate(${-dX}, ${-dY})`,
        function: SVGPathDataTransformer.TRANSLATE(-dX, -dY),
      });
    }

    if (width !== iconSize || height !== iconSize) {
      output.push({
        name: 'scale',
        attribute: `scale(${iconSize / width}, ${iconSize / height})`,
        function: SVGPathDataTransformer.SCALE(iconSize / width, iconSize / height),
      });
    }
    return output;
  } catch (error: any) {
    console.error(error);
    return [];
  }
}

export function svgParseAttributeTransform(attributes: TransformAttributes): SvgTransformation[] {
  if (!attributes.transform) return [];

  const output: SvgTransformation[] = [];

  const transformations = attributes.transform.match(/(rotate|translate|scale|skewX|skewY|matrix)\s*\(([^)]*)\)\s*/g) || [];
  for (let i = 0; i < transformations.length; i++) {
    const transformation = transformations[i];
    const matched = transformation.match(/[\w.-]+/g);
    if (!matched) continue;

    const [transformType, ...data] = matched;
    switch (transformType) {
      case 'rotate': {
        const a = parseFloat(data[0]);
        const x = data[1] ? parseFloat(data[1]) : undefined;
        const y = data[2] ? parseFloat(data[2]) : undefined;
        output.push({
          name: transformType,
          attribute: transformation,
          function: SVGPathDataTransformer.ROTATE(a, x, y),
        });
        break;
      }
      case 'translate': {
        const x = parseFloat(data[0]);
        const y = data[1] ? parseFloat(data[1]) : undefined;
        output.push({
          name: transformType,
          attribute: transformation,
          function: SVGPathDataTransformer.TRANSLATE(x, y),
        });
        break;
      }
      case 'skewX': {
        const a = parseFloat(data[0]);
        output.push({
          name: transformType,
          attribute: transformation,
          function: SVGPathDataTransformer.SKEW_X(a),
        });
        break;
      }
      case 'skewY': {
        const a = parseFloat(data[0]);
        output.push({
          name: transformType,
          attribute: transformation,
          function: SVGPathDataTransformer.SKEW_Y(a),
        });
        break;
      }
      case 'matrix': {
        const rest = data.map(parseFloat) as [number, number, number, number, number, number];
        output.push({
          name: transformType,
          attribute: transformation,
          function: SVGPathDataTransformer.MATRIX(...rest),
        });
        break;
      }
    }
  }

  return output;
}

export function svgNormaliseShapeSize(pathData: SVGPathData, maxShapeSize: number, errorRate = 1): SVGPathData {
  const { minX, maxX, minY, maxY } = pathData.getBounds();
  const shapeWidth = maxX - minX;
  const shapeHeight = maxY - minY;
  const shapeSize = Math.round(Math.max(shapeWidth, shapeHeight));

  // If the shape fits into a given square, we do nothing
  if (shapeSize < maxShapeSize + errorRate && shapeSize > maxShapeSize - errorRate) {
    return pathData;
  }

  return pathData.scale(maxShapeSize / shapeSize);
}

export function svgAlignShapeCenter(pathData: SVGPathData, canvasSize: number, maxShapeSize: number): SVGPathData {
  const padding = (canvasSize - maxShapeSize) / 2;
  const { minX, maxX, minY, maxY } = pathData.getBounds();
  const shapeWidth = maxX - minX;
  const shapeHeight = maxY - minY;

  const x = padding + (maxShapeSize - shapeWidth) / 2;
  const y = padding + (maxShapeSize - shapeHeight) / 2;

  return pathData.translate(-(minX - x), -(minY - y));
}