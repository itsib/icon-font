/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 *
 * @param input The Unicode input string (UCS-2).
 * @returns {number[]} The new array of code points.
 */
export function ucs2decode(input: string): number[] {
  const output: number[] = [];
  let counter = 0;
  const length = input.length;

  while (counter < length) {
    const value = input.charCodeAt(counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      const extra = input.charCodeAt(counter++);
      if ((extra & 0xFC00) == 0xDC00) {
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
}

/**
 * Creates a string based on an array of numeric code points.
 *
 * @param {number[]} codePoints The array of numeric code points.
 * @returns {string} The new Unicode string (UCS-2).
 */
export function ucs2encode(codePoints: number[]): string {
  return String.fromCodePoint(...codePoints);
}

/**
 * Encode symbol to represent in HTML page
 * @param codePoints
 */
export function encodeHtml(codePoints: number[]): string {
  return codePoints.map(code => `&#x${(code).toString(16).toUpperCase()};`).join('');
}

/**
 * Decode HTML to codepoints
 * @param htmlCharacter
 */
export function decodeHtml(htmlCharacter: string): number[] {
  return htmlCharacter
    .split('&#x')
    .map((source, index, codes) => {
      if (index === codes.length - 1) {
        return null;
      }
      return parseInt(source.slice(0, -1), 16);
    })
    .filter<number>(code => typeof code === 'number');
}