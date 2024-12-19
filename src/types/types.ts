export interface FileMetadata {
  /**
   * File index in alphabetic sort
   */
  index: number;
  /**
   * Symbol name
   */
  name: string;
  /**
   * Absolute file path to svg file
   */
  file: string;
}

export interface SymbolMetadata {
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
  file: string;
  /**
   * Total svg viewport size. height == width
   */
  size: number;
  /**
   * Shape paddings. Shape will be normalized and alignment
   */
  padding: number;
}

export interface BufferWithMeta<Meta> extends Buffer {
  metadata: Meta;
}

export interface Font {
  /**
   * Name of font face
   *
   * @alias 'font-family'
   */
  fontFamily: string;
  /**
   *  The units-per-em attribute specifies the number of coordinate units
   *  on the "em square", an abstract square whose height is the intended
   *  distance between lines of type in the same type size.
   *
   * alias 'units-per-em'
   */
  unitsPerEm: number;
  /**
   * The recommended distance above the baseline
   * for singled spaced text.
   */
  ascent: number;
  /**
   * The recommended distance below the baseline
   * for singled spaced text.
   */
  descent: number;

  baseline: number;

  fontWeight: number;

  fontStyle: number;
}

export interface SymbolMeta {
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
   * X symbol position in rect canvas
   */
  x: number;
  /**
   * Y symbol position in rect canvas
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
   * The number of font design units per em unit.
   */
  unitsPerEm: number;
}


