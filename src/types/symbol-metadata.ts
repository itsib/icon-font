export interface SymbolMetadata {
  /**
   * File index in alphabetic sort
   */
  index: number;
  /**
   * Unique name of character in font set.
   * I use kebab-case name, plus numerical index
   * suffix eq. «settings-outline-15»
   */
  name: string;
  /**
   * Numeric codepoint represent this char in the unicode table
   */
  codepoint: number;
  /**
   * X-axis shape position relative rect box
   */
  x: number;
  /**
   * Y-axis shape position relative rect box
   */
  y: number;
  /**
   * Inner shape width
   */
  width: number;
  /**
   * Inner shape height
   */
  height: number;
  /**
   * The size of the square where the outline of the icon is inscribed is
   * always 512 for generating icons.
   */
  boxSize: number;
}
