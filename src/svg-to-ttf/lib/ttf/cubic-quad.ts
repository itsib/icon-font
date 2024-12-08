// Precision used to check determinant in quad and cubic solvers,
// any number lower than this is considered to be zero.
// `8.67e-19` is an example of real error occurring in tests.
const epsilon = 1e-16;

export interface PointLike {
  x: number;
  y: number;
}

export type BytesArrayEight = [number, number, number, number, number, number, number, number];

export type Curve = [Point, Point, Point];

export class Point implements PointLike {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(point: PointLike): Point {
    return new Point(this.x + point.x, this.y + point.y);
  }

  sub(point: PointLike): Point {
    return new Point(this.x - point.x, this.y - point.y);
  }

  mul(multiplier: number): Point {
    return new Point(this.x * multiplier, this.y * multiplier);
  }

  div(divider: number): Point {
    return new Point(this.x / divider, this.y / divider);
  }

  sqr(): number {
    return this.x * this.x + this.y * this.y;
  }

  dot(point: PointLike): number {
    return this.x * point.x + this.y * point.y;
  }
}

function calcPowerCoefficients(p1: Point, c1: Point, c2: Point, p2: Point): [Point, Point, Point, Point] {
  // point(t) = p1*(1-t)^3 + c1*t*(1-t)^2 + c2*t^2*(1-t) + p2*t^3 = a*t^3 + b*t^2 + c*t + d
  // for each t value, so
  // a = (p2 - p1) + 3 * (c1 - c2)
  // b = 3 * (p1 + c2) - 6 * c1
  // c = 3 * (c1 - p1)
  // d = p1
  const a = p2.sub(p1).add(c1.sub(c2).mul(3));
  const b = p1.add(c2).mul(3).sub(c1.mul(6));
  const c = c1.sub(p1).mul(3);
  const d = p1;
  return [a, b, c, d]
}

function calcPowerCoefficientsQuad(p1: Point, c1: Point, p2: Point): [Point, Point, Point] {
  // point(t) = p1*(1-t)^2 + c1*t*(1-t) + p2*t^2 = a*t^2 + b*t + c
  // for each t value, so
  // a = p1 + p2 - 2 * c1
  // b = 2 * (c1 - p1)
  // c = p1
  const a = c1.mul(-2).add(p1).add(p2);
  const b = c1.sub(p1).mul(2);
  const c = p1;
  return [a, b, c]
}

function calcPoint(a: Point, b: Point, c: Point, d: Point, t: number): Point {
  // a*t^3 + b*t^2 + c*t + d = ((a*t + b)*t + c)*t + d
  return a.mul(t).add(b).mul(t).add(c).mul(t).add(d);
}

function calcPointQuad(a: Point, b: Point, c: Point, t: number): Point {
  // a*t^2 + b*t + c = (a*t + b)*t + c
  return a.mul(t).add(b).mul(t).add(c);
}

function calcPointDerivative(a: Point, b: Point, c: Point, d: Point, t: number): Point {
  // d/dt[a*t^3 + b*t^2 + c*t + d] = 3*a*t^2 + 2*b*t + c = (3*a*t + 2*b)*t + c
  return a.mul(3 * t).add(b.mul(2)).mul(t).add(c)
}

function quadSolve(a: number, b: number, c: number): number[] {
  // a*x^2 + b*x + c = 0
  if (a === 0) {
    return (b === 0) ? [] : [-c / b]
  }
  const D = b * b - 4 * a * c;
  if (Math.abs(D) < epsilon) {
    return [-b / (2 * a)]
  } else if (D < 0) {
    return []
  }
  const DSqrt = Math.sqrt(D);
  return [(-b - DSqrt) / (2 * a), (-b + DSqrt) / (2 * a)]
}

/*
 * Calculate a distance between a `point` and a line segment `p1, p2`
 * (result is squared for performance reasons), see details here:
 * https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
 */
function minDistanceToLineSq(point: Point, p1: Point, p2: Point): number {
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

function processSegment(a: Point, b: Point, c: Point, d: Point, t1: number, t2: number): [Point, Point, Point] {
  // Find a single control point for given segment of cubic Bezier curve
  // These control point is an interception of tangent lines to the boundary points
  // Let's denote that f(t) is a vector function of parameter t that defines the cubic Bezier curve,
  // f(t1) + f'(t1)*z1 is a parametric equation of tangent line to f(t1) with parameter z1
  // f(t2) + f'(t2)*z2 is the same for point f(t2) and the vector equation
  // f(t1) + f'(t1)*z1 = f(t2) + f'(t2)*z2 defines the values of parameters z1 and z2.
  // Defining fx(t) and fy(t) as the x and y components of vector function f(t) respectively
  // and solving the given system for z1 one could obtain that
  //
  //      -(fx(t2) - fx(t1))*fy'(t2) + (fy(t2) - fy(t1))*fx'(t2)
  // z1 = ------------------------------------------------------.
  //            -fx'(t1)*fy'(t2) + fx'(t2)*fy'(t1)
  //
  // Let's assign letter D to the denominator and note that if D = 0 it means that the curve actually
  // is a line. Substituting z1 to the equation of tangent line to the point f(t1), one could obtain that
  // cx = [fx'(t1)*(fy(t2)*fx'(t2) - fx(t2)*fy'(t2)) + fx'(t2)*(fx(t1)*fy'(t1) - fy(t1)*fx'(t1))]/D
  // cy = [fy'(t1)*(fy(t2)*fx'(t2) - fx(t2)*fy'(t2)) + fy'(t2)*(fx(t1)*fy'(t1) - fy(t1)*fx'(t1))]/D
  // where c = (cx, cy) is the control point of quadratic Bezier curve.

  const f1 = calcPoint(a, b, c, d, t1);
  const f2 = calcPoint(a, b, c, d, t2);
  const f1_ = calcPointDerivative(a, b, c, d, t1);
  const f2_ = calcPointDerivative(a, b, c, d, t2);

  const D = -f1_.x * f2_.y + f2_.x * f1_.y;
  if (Math.abs(D) < 1e-8) {
    return [f1, f1.add(f2).div(2), f2]; // straight line segment
  }
  const cx = (f1_.x * (f2.y * f2_.x - f2.x * f2_.y) + f2_.x * (f1.x * f1_.y - f1.y * f1_.x)) / D;
  const cy = (f1_.y * (f2.y * f2_.x - f2.x * f2_.y) + f2_.y * (f1.x * f1_.y - f1.y * f1_.x)) / D;
  return [f1, new Point(cx, cy), f2];
}

/*
 * Divide cubic and quadratic curves into 10 points and 9 line segments.
 * Calculate distances between each point on cubic and nearest line segment
 * on quadratic (and vice versa), and make sure all distances are less
 * than `errorBound`.
 *
 * We need to calculate BOTH distance from all points on quadratic to any cubic,
 * and all points on cubic to any quadratic.
 *
 * If we do it only one way, it may lead to an error if the entire original curve
 * falls within errorBound (then **any** quad will erroneously treated as good):
 * https://github.com/fontello/svg2ttf/issues/105#issuecomment-842558027
 *
 *  - a,b,c,d define cubic curve (power coefficients)
 *  - tmin, tmax are boundary points on cubic curve (in 0-1 range)
 *  - p1, c1, p2 define quadratic curve (control points)
 *  - errorBound is maximum allowed distance
 */
function isSegmentApproximationClose(a: Point, b: Point, c: Point, d: Point, tmin: number, tmax: number, p1: Point, c1: Point, p2: Point, errorBound: number): boolean {
  const n = 10; // number of points
  let t, dt;
  const p = calcPowerCoefficientsQuad(p1, c1, p2);
  const qa = p[0], qb = p[1], qc = p[2];
  let i, j, distSq;
  const errorBoundSq = errorBound * errorBound;
  const cubicPoints = [];
  const quadPoints = [];
  let minDistSq;

  dt = (tmax - tmin) / n;
  for (i = 0, t = tmin; i <= n; i++, t += dt) {
    cubicPoints.push(calcPoint(a, b, c, d, t));
  }

  dt = 1 / n;
  for (i = 0, t = 0; i <= n; i++, t += dt) {
    quadPoints.push(calcPointQuad(qa, qb, qc, t));
  }

  for (i = 1; i < cubicPoints.length - 1; i++) {
    minDistSq = Infinity;
    for (j = 0; j < quadPoints.length - 1; j++) {
      distSq = minDistanceToLineSq(cubicPoints[i], quadPoints[j], quadPoints[j + 1]);
      minDistSq = Math.min(minDistSq, distSq);
    }
    if (minDistSq > errorBoundSq) return false;
  }

  for (i = 1; i < quadPoints.length - 1; i++) {
    minDistSq = Infinity;
    for (j = 0; j < cubicPoints.length - 1; j++) {
      distSq = minDistanceToLineSq(quadPoints[i], cubicPoints[j], cubicPoints[j + 1]);
      minDistSq = Math.min(minDistSq, distSq);
    }
    if (minDistSq > errorBoundSq) return false;
  }

  return true;
}

function _isApproximationClose(a: Point, b: Point, c: Point, d: Point, quadCurves: Curve[], errorBound?: number): boolean {
  const dt = 1 / quadCurves.length;
  for (let i = 0; i < quadCurves.length; i++) {
    const p1 = quadCurves[i][0];
    const c1 = quadCurves[i][1];
    const p2 = quadCurves[i][2];
    if (!isSegmentApproximationClose(a, b, c, d, i * dt, (i + 1) * dt, p1, c1, p2, errorBound || 0)) {
      return false;
    }
  }
  return true;
}

function toFlatArray(quadsList: Curve[]): number[] {
  const result: number[] = [];
  result.push(quadsList[0][0].x);
  result.push(quadsList[0][0].y);
  for (let i = 0; i < quadsList.length; i++) {
    result.push(quadsList[i][1].x);
    result.push(quadsList[i][1].y);
    result.push(quadsList[i][2].x);
    result.push(quadsList[i][2].y);
  }
  return result;
}

/*
 * Split cubic bézier curve into two cubic curves, see details here:
 * https://math.stackexchange.com/questions/877725
 */
function subdivideCubic(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, t: number): [BytesArrayEight, BytesArrayEight] {
  const u = 1 - t;
  const v = t;

  const bx = x1 * u + x2 * v;
  const sx = x2 * u + x3 * v;
  const fx = x3 * u + x4 * v;
  const cx = bx * u + sx * v;
  const ex = sx * u + fx * v;
  const dx = cx * u + ex * v;

  const by = y1 * u + y2 * v;
  const sy = y2 * u + y3 * v;
  const fy = y3 * u + y4 * v;
  const cy = by * u + sy * v;
  const ey = sy * u + fy * v;
  const dy = cy * u + ey * v;

  return [
    [x1, y1, bx, by, cx, cy, dx, dy],
    [dx, dy, ex, ey, fx, fy, x4, y4]
  ];
}

function byNumber(x: number, y: number): number {
  return x - y;
}

/*
 * Find inflection points on a cubic curve, algorithm is similar to this one:
 * http://www.caffeineowl.com/graphics/2d/vectorial/cubic-inflexion.html
 */
function solveInflections(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): number[] {
  const p = -(x4 * (y1 - 2 * y2 + y3)) + x3 * (2 * y1 - 3 * y2 + y4) +
    x1 * (y2 - 2 * y3 + y4) - x2 * (y1 - 3 * y3 + 2 * y4);
  const q = x4 * (y1 - y2) + 3 * x3 * (-y1 + y2) + x2 * (2 * y1 - 3 * y3 + y4) - x1 * (2 * y2 - 3 * y3 + y4);
  const r = x3 * (y1 - y2) + x1 * (y2 - y3) + x2 * (-y1 + y3);

  return quadSolve(p, q, r).filter(function(t) {
    return t > 1e-8 && t < 1 - 1e-8;
  }).sort(byNumber);
} // +

/*
 * Approximate cubic Bezier curve defined with base points p1, p2 and control points c1, c2 with
 * with a few quadratic Bezier curves.
 * The function uses tangent method to find quadratic approximation of cubic curve segment and
 * simplified Hausdorff distance to determine number of segments that is enough to make error small.
 * In general the method is the same as described here: https://fontforge.github.io/bezier.html.
 */
function _cubicToQuad(p1x: number, p1y: number, c1x: number, c1y: number, c2x: number, c2y: number, p2x: number, p2y: number, errorBound?: number) {
  const p1 = new Point(p1x, p1y);
  const c1 = new Point(c1x, c1y);
  const c2 = new Point(c2x, c2y);
  const p2 = new Point(p2x, p2y);
  const [a, b, c, d] = calcPowerCoefficients(p1, c1, c2, p2);

  let approximation: any[] = [];
  for (let i = 1; i <= 8; i++) {
    approximation = [];
    for (let j = 0; j < 1; j += (1 / i)) {
      approximation.push(processSegment(a, b, c, d, j, j + (1 / i)));
    }
    if (i === 1 &&
      (approximation[0][1].sub(p1).dot(c1.sub(p1)) < 0 ||
        approximation[0][1].sub(p2).dot(c2.sub(p2)) < 0)) {
      // approximation concave, while the curve is convex (or vice versa)
      continue;
    }
    if (_isApproximationClose(a, b, c, d, approximation, errorBound)) {
      break;
    }
  }
  return toFlatArray(approximation);
}

/*
 * If this curve has any inflection points, split the curve and call
 * _cubicToQuad function on each resulting curve.
 */
export function cubicToQuad(p1x: number, p1y: number, c1x: number, c1y: number, c2x: number, c2y: number, p2x: number, p2y: number, errorBound?: number): number[] {
  const inflections = solveInflections(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);

  if (!inflections.length) {
    return _cubicToQuad(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, errorBound);
  }

  let result: number[] = [];
  let curve = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
  let prevPoint = 0;
  let quad: number[];
  let split;

  for (let inflectionIdx = 0; inflectionIdx < inflections.length; inflectionIdx++) {
    split = subdivideCubic(
      curve[0], curve[1], curve[2], curve[3],
      curve[4], curve[5], curve[6], curve[7],
      // we make a new curve, so adjust inflection point accordingly
      1 - (1 - inflections[inflectionIdx]) / (1 - prevPoint)
    );

    quad = _cubicToQuad(
      split[0][0], split[0][1], split[0][2], split[0][3],
      split[0][4], split[0][5], split[0][6], split[0][7],
      errorBound
    );

    result = result.concat(quad.slice(0, -2));
    curve = split[1];
    prevPoint = inflections[inflectionIdx];
  }

  quad = _cubicToQuad(
    curve[0], curve[1], curve[2], curve[3],
    curve[4], curve[5], curve[6], curve[7],
    errorBound
  );

  return result.concat(quad);
}
