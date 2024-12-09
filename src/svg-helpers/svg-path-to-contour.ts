import { SVGPathData } from 'svg-pathdata';
import { svgCubicToQuad } from './svg-cubic-to-quad.ts';
import { round } from '../utils/round.ts';
import { Contour, ContourPoint } from '../types';
import { Point } from '../entities/point.ts';

export function svgPathToContour(pathData: SVGPathData, accuracy = 0.3): Contour[] {
  let lastX = 0;
  let lastY = 0;
  let contourStartX = 0;
  let contourStartY = 0;

  let contours: Contour[] = [];
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

  contours = simplify(contours, 0.3);
  contours = simplify(contours, 0.3);
  contours = interpolate(contours, 1.1);
  contours = removeClosingReturnPoints(contours);
  contours = toRelative(contours);

  return contours;
}

function simplify(contours: Contour[], accuracy: number): Contour[] {
  for (let i = 0; i < contours.length; i++) {
    const contour = contours[i];

    let curr: ContourPoint;
    let prev: ContourPoint;
    let next: ContourPoint;

    for (let i = contour.points.length - 2; i > 1; i--) {
      prev = contour.points[i - 1];
      next = contour.points[i + 1];
      curr = contour.points[i];

      if (prev.onCurve && next.onCurve) {
        const p = new Point(curr.x, curr.y);
        const pPrev = new Point(prev.x, prev.y);
        const pNext = new Point(next.x, next.y);
        if (Point.isInLine(pPrev, p, pNext, accuracy)) {
          contour.points.splice(i, 1);
        }
      }
    }
  }
  return contours;
}

function interpolate(contours: Contour[], accuracy: number): Contour[] {
  return contours.map<Contour>((contour: Contour) => {
    const resContour: Contour = {
      points: [],
    };

    for (let i = 0; i < contour.points.length; i++) {
      const point: ContourPoint = contour.points[i];
      if (i === 0 || i === (contour.points.length - 1)) {
        resContour.points.push({
          x: Math.round(point.x),
          y: Math.round(point.y),
          onCurve: point.onCurve,
        });
        continue;
      }

      const prev = contour.points[i - 1];
      const next = contour.points[i + 1];

      if (!prev.onCurve && point.onCurve && !next.onCurve) {
        const p = new Point(point.x, point.y);
        const pPrev = new Point(prev.x, prev.y);
        const pNext = new Point(next.x, next.y);
        if (pPrev.add(pNext).div(2).sub(p).dist() < accuracy) {
          continue;
        }
      }
      resContour.points.push({
        x: Math.round(point.x),
        y: Math.round(point.y),
        onCurve: point.onCurve,
      });
    }
    return resContour;
  });
}

function removeClosingReturnPoints(contours: Contour[]): Contour[] {
  return contours.map((contour: Contour) => {
    const length = contour.points.length;

    if (length > 1 &&
      contour.points[0].x === contour.points[length - 1].x &&
      contour.points[0].y === contour.points[length - 1].y) {
      contour.points.splice(length - 1);
    }
    return contour;
  });
}

function toRelative(contours: Contour[]): Contour[] {
  let prevPoint = { x: 0, y: 0 };
  const resContours: Contour[] = [];
  let resContour: Contour;

  for (let i = 0; i < contours.length; i++) {
    const contour = contours[i];

    resContour = {
      points: [],
    };
    resContours.push(resContour);
    for (let j = 0; j < contour.points.length; j++) {
      const point = contour.points[j];
      resContour.points.push({
        x: point.x - prevPoint.x,
        y: point.y - prevPoint.y,
        onCurve: point.onCurve
      });
      prevPoint = point;
    }
  }

  return resContours;
}