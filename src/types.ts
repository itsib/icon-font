
export type FontType = 'woff2' | 'woff' | 'ttf' | 'eot' | 'svg';

export interface IconFontConfig {
  /**
   * Directory containing SVG icons.
   */
  input: string;
  /**
   * Directory to store generated files (Fonts, Css, etc.)
   */
  output: string;
  /**
   * Font name.
   * @default 'icon-font'
   */
  name?: string;
  /**
   * Font types to generate
   */
  types?: FontType[];
  /**
   * Tmp path
   */
  tmp?: string;
  /**
   * Demo server port
   */
  port?: number;
}

export interface IconInfo {
  encodedCode: string,
  prefix: string,
  className: string,
  unicode: string,
}