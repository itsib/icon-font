// Precision used to check determinant in quad and cubic solvers,
// any number lower than this is considered to be zero.
// `8.67e-19` is an example of real error occurring in tests.
import { Point } from '../entities/point.ts';

const epsilon = 1e-16;

export type PointArray = [number, number, number, number, number, number, number, number];

export type Curve = [Point, Point, Point];

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

  const f1 = Point.calcPoint(a, b, c, d, t1);
  const f2 = Point.calcPoint(a, b, c, d, t2);
  const f1_ = Point.calcPointDerivative(a, b, c, d, t1);
  const f2_ = Point.calcPointDerivative(a, b, c, d, t2);

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
  const p = Point.calcPowerCoefficientsQuad(p1, c1, p2);
  const qa = p[0], qb = p[1], qc = p[2];
  let i, j, distSq;
  const errorBoundSq = errorBound * errorBound;
  const cubicPoints = [];
  const quadPoints = [];
  let minDistSq;

  dt = (tmax - tmin) / n;
  for (i = 0, t = tmin; i <= n; i++, t += dt) {
    cubicPoints.push(Point.calcPoint(a, b, c, d, t));
  }

  dt = 1 / n;
  for (i = 0, t = 0; i <= n; i++, t += dt) {
    quadPoints.push(Point.calcPointQuad(qa, qb, qc, t));
  }

  for (i = 1; i < cubicPoints.length - 1; i++) {
    minDistSq = Infinity;
    for (j = 0; j < quadPoints.length - 1; j++) {
      distSq = Point.calcMinDistanceToLine(cubicPoints[i], quadPoints[j], quadPoints[j + 1]);
      minDistSq = Math.min(minDistSq, distSq);
    }
    if (minDistSq > errorBoundSq) return false;
  }

  for (i = 1; i < quadPoints.length - 1; i++) {
    minDistSq = Infinity;
    for (j = 0; j < cubicPoints.length - 1; j++) {
      distSq = Point.calcMinDistanceToLine(quadPoints[i], cubicPoints[j], cubicPoints[j + 1]);
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
function subdivideCubic(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, t: number): [PointArray, PointArray] {
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

/*
 * Find inflection points on a cubic curve, algorithm is similar to this one:
 * http://www.caffeineowl.com/graphics/2d/vectorial/cubic-inflexion.html
 */
function solveInflections(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): number[] {
  const p = -(x4 * (y1 - 2 * y2 + y3)) + x3 * (2 * y1 - 3 * y2 + y4) +
    x1 * (y2 - 2 * y3 + y4) - x2 * (y1 - 3 * y3 + 2 * y4);
  const q = x4 * (y1 - y2) + 3 * x3 * (-y1 + y2) + x2 * (2 * y1 - 3 * y3 + y4) - x1 * (2 * y2 - 3 * y3 + y4);
  const r = x3 * (y1 - y2) + x1 * (y2 - y3) + x2 * (-y1 + y3);

  return quadSolve(p, q, r).filter(t => (t > 1e-8 && t < 1 - 1e-8)).sort((x, y) => x - y);
}

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
  const [a, b, c, d] = Point.calcPowerCoefficients(p1, c1, c2, p2);

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
export function svgCubicToQuad(p1x: number, p1y: number, c1x: number, c1y: number, c2x: number, c2y: number, p2x: number, p2y: number, errorBound?: number): number[] {
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
