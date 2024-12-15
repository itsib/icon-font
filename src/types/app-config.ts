export type FontType = 'woff2' | 'woff' | 'ttf' | 'eot' | 'svg';

export interface AppConfig {
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