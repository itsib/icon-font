function identifier(value: string, littleEndian?: number) {
  let result = 0;

  for (let i = 0; i < value.length; i++) {
    result = result << 8;
    let index = littleEndian ? value.length - i - 1 : i;

    result += value.charCodeAt(index);
  }

  return result;
}