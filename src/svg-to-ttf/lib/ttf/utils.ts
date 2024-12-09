import { Point } from '../../../entities/point.ts';
import { Contour, ContourPoint } from '../../../types';

export function simplify(contours: Contour[], accuracy: number): Contour[] {
  return contours.map((contour: Contour) => {
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
    return contour;
  });
}

export function interpolate(contours: Contour[], accuracy: number): Contour[] {
  return contours.map<Contour>((contour: Contour) => {
    const resContour: Contour = {
      points: [],
    };

    for (let i = 0; i < contour.points.length; i++) {
      const point: ContourPoint = contour.points[i];
      if (i === 0 || i === (contour.points.length - 1)) {
        resContour.points.push(point);
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
      resContour.points.push(point);
    }
    return resContour;
  });
}

export function roundPoints(contours: Contour[]): Contour[] {
  return contours.map((contour: Contour) => {
    contour.points = contour.points.map((point: ContourPoint) => {
      return { x: Math.round(point.x), y: Math.round(point.y), onCurve: point.onCurve };
    });
    return contour;
  });
}

export function removeClosingReturnPoints(contours: Contour[]): Contour[] {
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

export function toRelative(contours: Contour[]): Contour[] {
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

