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
  /**
   * Adds the GET parameter 'hash=${HASH}'
   * at the end of the URL to reset the browser cache.
   * Set to 'random' for random number.
   * Or use yur own value
   * @default false - is disabled
   */
  fontUrlHash: string | 'random' | false;
}