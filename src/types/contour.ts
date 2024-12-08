export interface PointLike {
  x: number;
  y: number;
}

export interface ContourPoint extends PointLike {
  onCurve: boolean;
  x: number;
  y: number;
}

export class Contour {
  points: ContourPoint[] = [];
}