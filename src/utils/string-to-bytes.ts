export function tableIdentifier(value: string, littleEndian?: number): number {
  let result = 0;

  for (let i = 0; i < value.length; i++) {
    result = result << 8;
    let index = littleEndian ? value.length - i - 1 : i;

    result += value.charCodeAt(index);
  }

  return result;
}

export function stringToAscII(str: string): Uint8Array {
  const bytes: number[] = [];
  const len = str ? (str.length < 256 ? str.length : 255) : 0;

  bytes.push(len);
  for (let i = 0; i < len; i++) {
    const char = str.charCodeAt(i);

    // non-ASCII characters are substituted with '_'
    bytes.push(char < 128 ? char : 95);
  }
  return Uint8Array.from(bytes);
}

export function toUTF8Bytes(str: string): Uint8Array {
  const byteArray = [];

  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) <= 0x7F) {
      byteArray.push(str.charCodeAt(i));
    } else {
      const h = encodeURIComponent(str.charAt(i)).slice(1).split('%');

      for (let j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16));
      }
    }
  }

  return Uint8Array.from(byteArray);
}

export function toUCS2Bytes(str: string): Uint8Array {
  const byteArray = [];
  let ch;

  for (let i = 0; i < str.length; ++i) {
    ch = str.charCodeAt(i);  // get char
    byteArray.push(ch >> 8);
    byteArray.push(ch & 0xFF);
  }
  return Uint8Array.from(byteArray);
}

export function dateToUInt64(date: Date): number {
  const startDate = new Date('1904-01-01T00:00:00.000Z');
  return Math.floor((date.getTime() - startDate.getTime()) / 1000);
}

