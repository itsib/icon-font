export function round(value: number, precision = 1): number {
  return Math.round(value * precision) / precision;
}