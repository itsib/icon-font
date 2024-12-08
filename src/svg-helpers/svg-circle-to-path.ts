export interface CircleAttributes {
  cx?: string;
  cy?: string;
  rx?: string;
  ry?: string;
  r?: string;
}

export function svgCircleToPath(attributes: CircleAttributes): string {
  const cx = attributes.cx && parseFloat(attributes.cx) || 0;
  const cy = attributes.cy && parseFloat(attributes.cy) || 0;
  const r = attributes.r && parseFloat(attributes.r) || 0;
  const rx = attributes.rx && parseFloat(attributes.rx) || r;
  const ry = attributes.ry && parseFloat(attributes.ry) || r;

  return `M${cx - rx},${cy}A${rx},${ry} 0,0,0 ${cx + rx},${cy}A${rx},${ry} 0,0,0 ${cx - rx},${cy}`;
}