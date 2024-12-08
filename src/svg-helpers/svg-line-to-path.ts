export interface LineAttributes {
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
}

export function svgLineToPath(attributes: LineAttributes): string {
  const x1 = attributes.x1 && parseFloat(attributes.x1) || 0;
  const y1 = attributes.y1 && parseFloat(attributes.y1) || 0;
  const x2 = attributes.x2 && parseFloat(attributes.x2) || 0;
  const y2 = attributes.y2 && parseFloat(attributes.y2) || 0;

  return `M${x1} ${y1} ${x1 + 1} ${y1 + 1} ${x2 + 1} ${y2 + 1} ${x2} ${y2}Z`;
}