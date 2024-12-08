export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
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
}

/*
 * Check if 3 points are in line, and second in the middle.
 * Used to replace quad curves with lines or join lines
 *
 */
export function isInLine(p1: Point, m: Point, p2: Point, accuracy: number): boolean {
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


