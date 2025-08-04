export type FontType = 'woff2' | 'woff' | 'ttf' | 'eot' | 'svg';

export interface IconTune {
  /**
   * The x-axis displacement of the icon.
   * In basis point (percent / 100)
   */
  x?: number;
  /**
   * The x-axis displacement of the icon.
   * In basis point (percent / 100)
   */
  y?: number;
  /**
   * Tune the icon size.
   *
   * @description
   * - If a number is passed, the size will be multiplied by it.
   *   For example, the icon is 300x500, size = 1.2,
   *   then the result will be 360x600.
   * - If 'cover' is passed, the icon will
   *   fill the entire 512x512 square.
   * - If 'contain' is passed, the icon will
   *   be inscribed in a 512x512 square.
   *   This is default behavior.
   *
   * @default 'contain'
   */
  size?: number | 'cover' | 'contain';
}

export type IconsTune = { [name: string]: IconTune };

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
   * Or use your own value
   * @default false - is disabled
   */
  fontUrlHash: string | 'random' | false;
  /**
   * Adjust the size and
   * alignment for each individual icon.
   */
  iconsTune?: IconsTune;
  /**
   * The standard character block size is 512.
   * The size of the character in the block is 480.
   * With these default parameters,
   * ```shapeSizeAdjust = 480 / 512 = 0.9375```
   * In fact, this number means changing the size of characters.
   *
   * @default 0.9375
   */
  shapeSizeAdjust?: number;
  /**
   * The number of the unicode character that the font will be filled with icons from.
   * @default 0xea01
   */
  startUnicode?: number;
}

export interface ServerConfig extends Omit<AppConfig, 'output' | 'types' | 'fontUrl' | 'fontUrlHash'> {
  base?: string;
}