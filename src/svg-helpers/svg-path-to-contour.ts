import { SVGPathData } from 'svg-pathdata';
import { svgCubicToQuad } from './svg-cubic-to-quad.ts';
import { round } from '../utils/round.ts';
import { Contour } from '../types';

export function svgPathToContour(pathData: SVGPathData, accuracy = 0.3): Contour[] {
  pathData = pathData.toAbs().aToC().normalizeST();
  let lastX = 0;
  let lastY = 0;
  let contourStartX = 0;
  let contourStartY = 0;

  const contours: Contour[] = [];
  let contour: Contour = {
    points: [],
  };


  for (let i = 0; i < pathData.commands.length; i++) {
    const command = pathData.commands[i];

    if (i === 0 || command.type === SVGPathData.MOVE_TO) {
      contour = {
        points: [],
      };
      contours.push(contour);
    }

    switch (command.type) {
      case SVGPathData.MOVE_TO: {
        contour.points.push({ x: command.x, y: command.y, onCurve: true });

        lastX = command.x;
        lastY = command.y;
        contourStartX = lastX;
        contourStartY = lastY;
        break;
      }
      case SVGPathData.VERT_LINE_TO: {
        contour.points.push({ x: lastX, y: command.y, onCurve: true });

        lastY = command.y;
        break;
      }
      case SVGPathData.HORIZ_LINE_TO: {
        contour.points.push({ x: command.x, y: lastY, onCurve: true });

        lastX = command.x;
        break;
      }
      case SVGPathData.LINE_TO: {
        contour.points.push({ x: command.x, y: command.y, onCurve: true });

        lastX = command.x;
        lastY = command.y;
        break;
      }
      case SVGPathData.CURVE_TO: {
        const quadCurves = svgCubicToQuad(
          lastX, lastY,
          command.x1, command.y1,
          command.x2, command.y2,
          command.x, command.y,
          accuracy,
        );
        lastX = command.x;
        lastY = command.y;

        for (let i = 2; i < quadCurves.length; i += 4) {
          contour.points.push({ x: round(quadCurves[i]), y: round(quadCurves[i + 1]), onCurve: false });
          contour.points.push({ x: round(quadCurves[i + 2]), y: round(quadCurves[i + 3]), onCurve: true });

          lastX = quadCurves[i + 2];
          lastY = quadCurves[i + 3];
        }

        break;
      }
      case SVGPathData.QUAD_TO: {
        contour.points.push({ x: command.x1, y: command.y1, onCurve: false });
        contour.points.push({ x: command.x, y: command.y, onCurve: true });

        lastX = command.x1;
        lastY = command.y1;
        break;
      }
      case SVGPathData.CLOSE_PATH: {
        lastX = contourStartX;
        lastY = contourStartY;
        break;
      }
      default:
        throw new Error(`Type ${command.type} not implemented`);
    }
  }

  return contours;
}