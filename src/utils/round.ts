export function round(value: number, precision = 10000): number {
  return Math.round(value * precision) / precision;
}