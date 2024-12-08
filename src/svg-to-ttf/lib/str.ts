export default class Str {
  str: string;

  constructor(str: string) {
    this.str = str;
  }

  toUTF8Bytes(): Uint8Array {
    const byteArray = [];

    for (let i = 0; i < this.str.length; i++) {
      if (this.str.charCodeAt(i) <= 0x7F) {
        byteArray.push(this.str.charCodeAt(i));
      } else {
        const h = encodeURIComponent(this.str.charAt(i)).slice(1).split('%');

        for (let j = 0; j < h.length; j++) {
          byteArray.push(parseInt(h[j], 16));
        }
      }
    }

    return Uint8Array.from(byteArray);
  }

  toUCS2Bytes(): Uint8Array {
    const byteArray = [];
    let ch;

    for (let i = 0; i < this.str.length; ++i) {
      ch = this.str.charCodeAt(i);  // get char
      byteArray.push(ch >> 8);
      byteArray.push(ch & 0xFF);
    }
    return Uint8Array.from(byteArray);
  }
}

