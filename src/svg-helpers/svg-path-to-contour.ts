import { SVGPathData } from 'svg-pathdata';
import { Point } from '../svg-to-ttf/lib/sfnt.ts';
import { cubicToQuad } from '../svg-to-ttf/lib/ttf/cubic-quad.ts';
import { Segment, SegmentH, SegmentL, SegmentM, SegmentQ, SegmentS, SegmentV, SegmentZ } from '../types';
import { round } from '../utils/round.ts';

export function pathToSegments(pathData: SVGPathData, accuracy = 0.3): Segment[] {
  pathData = pathData.toAbs().aToC().normalizeST();
  let lastX = 0;
  let lastY = 0;
  let contourStartX = 0;
  let contourStartY = 0;
  const segments: Segment[] = [];

  for (let i = 0; i < pathData.commands.length; i++) {
    const command = pathData.commands[i];

    switch (command.type) {
      case SVGPathData.MOVE_TO: {
        lastX = command.x;
        lastY = command.y;
        contourStartX = lastX;
        contourStartY = lastY;

        segments.push(['M', command.x, command.y] as SegmentM);
        break;
      }
      case SVGPathData.VERT_LINE_TO: {
        lastY = command.y;
        segments.push(['V', command.y] as SegmentV);
        break;
      }
      case SVGPathData.HORIZ_LINE_TO: {
        lastX = command.x;
        segments.push(['H', command.x] as SegmentH);
        break;
      }
      case SVGPathData.LINE_TO: {
        lastX = command.x;
        lastY = command.y;
        segments.push(['L', command.x, command.y] as SegmentL);
        break;
      }
      case SVGPathData.CURVE_TO: {
        const quadCurves = cubicToQuad(
          lastX, lastY,
          command.x1, command.y1,
          command.x2, command.y2,
          command.x, command.y,
          accuracy,
        );
        lastX = command.x;
        lastY = command.y;

        for (let i = 2; i < quadCurves.length; i += 4) {
          segments.push(['Q', quadCurves[i], quadCurves[i + 1], quadCurves[i + 2], quadCurves[i + 3]]);

          lastX = quadCurves[i + 2];
          lastY = quadCurves[i + 3];
        }

        break;
      }
      case SVGPathData.QUAD_TO: {
        segments.push(['Q', command.x, command.y, command.x1, command.y1] as SegmentQ);
        lastX = command.x1;
        lastY = command.y1;
        break;
      }
      case SVGPathData.CLOSE_PATH: {
        lastX = contourStartX;
        lastY = contourStartY;
        segments.push(['Z'] as SegmentZ);
        break;
      }
      default:
        throw new Error(`Type ${command.type} not implemented`);
    }
  }

  return segments;
}

export function svgPathToContour(pathData: SVGPathData, accuracy = 0.3): Point[][] {
  pathData = pathData.toAbs().aToC().normalizeST();
  let lastX = 0;
  let lastY = 0;
  let contourStartX = 0;
  let contourStartY = 0;
  const segments: Segment[] = [];

  const contours: Point[][] = [];
  let contour: Point[] = [];


  for (let i = 0; i < pathData.commands.length; i++) {
    const command = pathData.commands[i];

    if (i === 0 || command.type === SVGPathData.MOVE_TO) {
      contour = [];
      contours.push(contour);
    }

    switch (command.type) {
      case SVGPathData.MOVE_TO: {
        segments.push(['M', command.x, command.y] as SegmentM);
        contour.push({ x: command.x, y: command.y, onCurve: true });

        lastX = command.x;
        lastY = command.y;
        contourStartX = lastX;
        contourStartY = lastY;
        break;
      }
      case SVGPathData.VERT_LINE_TO: {
        segments.push(['V', command.y] as SegmentV);
        contour.push({ x: lastX, y: command.y, onCurve: true });

        lastY = command.y;
        break;
      }
      case SVGPathData.HORIZ_LINE_TO: {
        segments.push(['H', command.x] as SegmentH);
        contour.push({ x: command.x, y: lastY, onCurve: true });

        lastX = command.x;
        break;
      }
      case SVGPathData.LINE_TO: {
        segments.push(['L', command.x, command.y] as SegmentL);
        contour.push({ x: command.x, y: command.y, onCurve: true });

        lastX = command.x;
        lastY = command.y;
        break;
      }
      case SVGPathData.CURVE_TO: {
        const quadCurves = cubicToQuad(
          lastX, lastY,
          command.x1, command.y1,
          command.x2, command.y2,
          command.x, command.y,
          accuracy,
        );
        lastX = command.x;
        lastY = command.y;

        for (let i = 2; i < quadCurves.length; i += 4) {
          segments.push(['Q', quadCurves[i], quadCurves[i + 1], quadCurves[i + 2], quadCurves[i + 3]]);

          contour.push({ x: round(quadCurves[i]), y: round(quadCurves[i + 1]), onCurve: false });
          contour.push({ x: round(quadCurves[i + 2]), y: round(quadCurves[i + 3]), onCurve: true });

          lastX = quadCurves[i + 2];
          lastY = quadCurves[i + 3];
        }

        break;
      }
      case SVGPathData.QUAD_TO: {
        segments.push(['Q', command.x1, command.y1, command.x, command.y] as SegmentQ);

        contour.push({ x: command.x1, y: command.y1, onCurve: false });
        contour.push({ x: command.x, y: command.y, onCurve: true });

        lastX = command.x1;
        lastY = command.y1;
        break;
      }
      case SVGPathData.CLOSE_PATH: {
        lastX = contourStartX;
        lastY = contourStartY;
        segments.push(['Z'] as SegmentZ);
        break;
      }
      default:
        throw new Error(`Type ${command.type} not implemented`);
    }
  }

  return contours;
}

// export function svgPathToContour(pathData: SVGPathData, accuracy = 0.3): Point[][] {
//   const segments = pathToSegments(pathData, accuracy);
//   const resContours: Point[][] = [];
//   let resContour: Point[] = [];
//
//   let lastX = 0;
//   let lastY = 0;
//   let contourStartX = 0;
//   let contourStartY = 0;
//
//   const contours: Point[] = [];
//   for (let i = 0; i < segments.length; i++) {
//     const segment = segments[i];
//
//     // Start new contour
//     if (i === 0 || segment[0] === 'M') {
//       resContour = [];
//       resContours.push(resContour);
//     }
//     const name = segment[0];
//
//
//     if (name === 'Q') {
//       resContour.push({ x: segment[1], y: segment[2], onCurve: false });
//     }
//
//     if (name === 'H') {
//       resContour.push({ x: segment[1], y: lastY, onCurve: true });
//     } else if (name === 'V') {
//       resContour.push({ x: lastX, y: segment[1], onCurve: true });
//     } else if (name !== 'Z') {
//       resContour.push({ x: segment[segment.length - 2] as number, y: segment[segment.length - 1] as number, onCurve: true });
//     }
//
//   }
//
//   return [contours];
// }