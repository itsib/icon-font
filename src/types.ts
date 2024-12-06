
export type FontType = 'woff2' | 'woff' | 'ttf' | 'eot' | 'svg';

export type ConfigKeys = keyof IconFontConfig;

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
  name: string;
  /**
   * Icon class prefix
   * @default "icon"
   */
  prefix: string;
  /**
   * Font types to generate
   */
  types: FontType[];
  /**
   * Demo server port
   */
  port: number;
  /**
   * Url path to icon font
   * Will be written to output css file in font face
   */
  fontUrl: string;
}

export interface IconFile {
  /**
   * Symbol id
   */
  id: string;
  /**
   * Digit code of Unicode symbol
   */
  code: number;
  /**
   * Symbol name
   */
  name: string;
  /**
   * Symbol presents as HTML hex unicode
   */
  unicode: string;
  /**
   * Absolute file path to svg file
   */
  path: string;
}
