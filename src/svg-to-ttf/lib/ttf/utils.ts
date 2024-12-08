import { Point, isInLine } from '../math.ts';

export interface PointType {
  x: number;
  y: number;
  onCurve: boolean;
}

export function simplify(contours: PointType[][], accuracy: number): PointType[][] {
  return contours.map((contour: PointType[]) => {
    let curr: PointType, prev: PointType, next: PointType;

    for (let i = contour.length - 2; i > 1; i--) {
      prev = contour[i - 1];
      next = contour[i + 1];
      curr = contour[i];

      if (prev.onCurve && next.onCurve) {
        const p = new Point(curr.x, curr.y);
        const pPrev = new Point(prev.x, prev.y);
        const pNext = new Point(next.x, next.y);
        if (isInLine(pPrev, p, pNext, accuracy)) {
          contour.splice(i, 1);
        }
      }
    }
    return contour;
  });
}

export function interpolate(contours: PointType[][], accuracy: number): PointType[][] {
  return contours.map<PointType[]>((contour: PointType[]) => {
    const resContour: PointType[] = [];

    for (let i = 0; i < contour.length; i++) {
      const point: PointType = contour[i];
      if (i === 0 || i === (contour.length - 1)) {
        resContour.push(point);
        continue;
      }

      const prev = contour[i - 1];
      const next = contour[i + 1];

      if (!prev.onCurve && point.onCurve && !next.onCurve) {
        const p = new Point(point.x, point.y);
        const pPrev = new Point(prev.x, prev.y);
        const pNext = new Point(next.x, next.y);
        if (pPrev.add(pNext).div(2).sub(p).dist() < accuracy) {
          continue;
        }
      }
      resContour.push(point);
    }
    return resContour;
  });
}

export function roundPoints(contours: PointType[][]): PointType[][] {
  return contours.map((contour: PointType[]) => {
    return contour.map((point: PointType) => {
      return { x: Math.round(point.x), y: Math.round(point.y), onCurve: point.onCurve };
    });
  });
}

export function removeClosingReturnPoints(contours: PointType[][]): PointType[][] {
  return contours.map((contour: PointType[]) => {
    const length = contour.length;

    if (length > 1 &&
      contour[0].x === contour[length - 1].x &&
      contour[0].y === contour[length - 1].y) {
      contour.splice(length - 1);
    }
    return contour;
  });
}

export function toRelative(contours: PointType[][]): PointType[][] {
  let prevPoint = { x: 0, y: 0 };
  const resContours: PointType[][] = [];
  let resContour: PointType[];

  for (let i = 0; i < contours.length; i++) {
    const contour = contours[i];

    resContour = [];
    resContours.push(resContour);
    for (let j = 0; j < contour.length; j++) {
      const point = contour[j];
      resContour.push({
        x: point.x - prevPoint.x,
        y: point.y - prevPoint.y,
        onCurve: point.onCurve
      });
      prevPoint = point;
    }
  }

  return resContours;
}

export function identifier(string: string, littleEndian?: boolean): number {
  let result = 0;

  for (let i = 0; i < string.length; i++) {
    result = result << 8;
    const index = littleEndian ? string.length - i - 1 : i;

    result += string.charCodeAt(index);
  }

  return result;
}

