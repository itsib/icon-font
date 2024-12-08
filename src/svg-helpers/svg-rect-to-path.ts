export interface RectAttributes {
  x?: string;
  y?: string;
  width?: string;
  height?: string;
  rx?: string;
  ry?: string;
}

export function svgRectToPath(attributes: RectAttributes): string {
  const x = attributes.x == null ? 0 : parseFloat(attributes.x);
  const y = attributes.y == null ? 0 : parseFloat(attributes.y);
  const width = attributes.width == null ? 0 : parseFloat(attributes.width);
  const height = attributes.height == null ? 0 : parseFloat(attributes.height);

  const rx = attributes.rx == null ? 0 : parseFloat(attributes.rx);
  const ry = attributes.ry == null ? 0 : parseFloat(attributes.ry);

  return `M${x + rx} ` +
    `${y}h${width - rx * 2}${rx || ry ? `a ${rx} ${ry} 0 0 1 ${rx} ${ry}` : ''}` +
    `v${height - ry * 2}${rx || ry ? `a ${rx} ${ry} 0 0 1 ${rx * -1} ${ry}` : ''}` +
    `h${(width - rx * 2) * -1}${rx || ry ? `a ${rx} ${ry} 0 0 1 ${rx * -1} ${ry * -1}` : ''}` +
    `v${(height - ry * 2) * -1}${rx || ry ? `a ${rx} ${ry} 0 0 1 ${rx} ${ry * -1}` : ''}` +
    'z';
}