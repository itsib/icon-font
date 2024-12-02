export function generateLogoSvg(): string {
  return `
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="4" ry="4" fill-rule="evenodd" stroke-width="0" style="paint-order:fill markers stroke"/>
  <g transform="matrix(1.00242 0 0 1.00242 .0471958 -.0616379)" stroke-width="1.23732">
    <circle cx="15.9174" cy="7.02139" r="2.31378" fill="#16d600"/>
    <circle cx="6.58493" cy="16.0229" r="2.31378" fill="#fff"/>
    <circle cx="15.9174" cy="25.0243" r="2.31378" fill="#0159ea"/>
    <path d="m4.26496 4.70142h4.63993v4.63993h-4.63993z" fill="#0159ea"/>
    <path d="m22.9299 13.7029h4.63993v4.63993h-4.63993z" fill="#16d600"/>
    <path d="m13.2757 18.3428 2.63548-4.63993 2.64786 4.63993z" fill="#fff"/>
    <path d="m22.9299 22.7044h4.63993v4.63993h-4.63993z" fill="#fff"/>
    <path d="m22.6143 9.34135 2.63548-4.63993 2.63548 4.63993z" fill="#0159ea"/>
    <path d="m3.94326 27.3443 2.63548-4.63993 2.64785 4.63993z" fill="#16d600"/>
  </g>
</svg>
  `;
}