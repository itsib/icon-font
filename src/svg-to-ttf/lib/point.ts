import { PointLike } from '../../types';

export class Point implements PointLike {
  x: number;
  y: number;

  /*
 * Check if 3 points are in line, and second in the middle.
 * Used to replace quad curves with lines or join lines
 *
 */
  static isInLine(p1: Point, m: Point, p2: Point, accuracy: number): boolean {
    const a = p1.sub(m).sqr();
    const b = p2.sub(m).sqr();
    const c = p1.sub(p2).sqr();

    // control point not between anchors
    if ((a > (b + c)) || (b > (a + c))) {
      return false;
    }

    // count distance via scalar multiplication
    const distance = Math.sqrt(Math.pow((p1.x - m.x) * (p2.y - m.y) - (p2.x - m.x) * (p1.y - m.y), 2) / c);

    return distance < accuracy;
  }

  static calcPoint(a: Point, b: Point, c: Point, d: Point, t: number): Point {
    // a*t^3 + b*t^2 + c*t + d = ((a*t + b)*t + c)*t + d
    return a.mul(t).add(b).mul(t).add(c).mul(t).add(d);
  }

  static calcPointQuad(a: Point, b: Point, c: Point, t: number): Point {
    // a*t^2 + b*t + c = (a*t + b)*t + c
    return a.mul(t).add(b).mul(t).add(c);
  }

  static calcPointDerivative(a: Point, b: Point, c: Point, d: Point, t: number): Point {
    // d/dt[a*t^3 + b*t^2 + c*t + d] = 3*a*t^2 + 2*b*t + c = (3*a*t + 2*b)*t + c
    return a.mul(3 * t).add(b.mul(2)).mul(t).add(c)
  }

  static calcPowerCoefficients(p1: Point, c1: Point, c2: Point, p2: Point): [Point, Point, Point, Point] {
    // point(t) = p1*(1-t)^3 + c1*t*(1-t)^2 + c2*t^2*(1-t) + p2*t^3 = a*t^3 + b*t^2 + c*t + d
    // for each t value, so
    // a = (p2 - p1) + 3 * (c1 - c2)
    // b = 3 * (p1 + c2) - 6 * c1
    // c = 3 * (c1 - p1)
    // d = p1
    const a = p2.sub(p1).add(c1.sub(c2).mul(3));
    const b = p1.add(c2).mul(3).sub(c1.mul(6));
    const c = c1.sub(p1).mul(3);
    const d = p1.clone();
    return [a, b, c, d]
  }

  static calcPowerCoefficientsQuad(p1: Point, c1: Point, p2: Point): [Point, Point, Point] {
    // point(t) = p1*(1-t)^2 + c1*t*(1-t) + p2*t^2 = a*t^2 + b*t + c
    // for each t value, so
    // a = p1 + p2 - 2 * c1
    // b = 2 * (c1 - p1)
    // c = p1
    const a = c1.mul(-2).add(p1).add(p2);
    const b = c1.sub(p1).mul(2);
    const c = p1.clone();
    return [a, b, c]
  }

  /**
   *  Calculate a distance between a `point` and a line segment `p1, p2`
   *  (result is squared for performance reasons), see details here:
   * @param point
   * @param p1
   * @param p2
   */
  static calcMinDistanceToLine(point: Point, p1: Point, p2: Point): number {
    const p1p2 = p2.sub(p1);
    const dot = point.sub(p1).dot(p1p2);
    const lenSq = p1p2.sqr();
    let param = 0;
    let diff;
    if (lenSq !== 0) param = dot / lenSq
    if (param <= 0) {
      diff = point.sub(p1)
    } else if (param >= 1) {
      diff = point.sub(p2)
    } else {
      diff = point.sub(p1.add(p1p2.mul(param)))
    }
    return diff.sqr()
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  add(point: Point): Point {
    return new Point(this.x + point.x, this.y + point.y);
  }

  sub(point: Point): Point {
    return new Point(this.x - point.x, this.y - point.y);
  }

  mul(value: number): Point {
    return new Point(this.x * value, this.y * value);
  }

  div(value: number): Point {
    return new Point(this.x / value, this.y / value);
  }

  dist(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  sqr(): number {
    return this.x * this.x + this.y * this.y;
  }

  dot(point: PointLike): number {
    return this.x * point.x + this.y * point.y;
  }
}


