const testExpression = /(^|\/|\\)(?:((?:u[0-9a-f]{4,6},?)+)-)(.+)\.svg$/i;

export function compareFiles(fileA: string, fileB: string): -1 | 0 | 1 {
  const hasUnicodeA = testExpression.test(fileA);
  const hasUnicodeB = testExpression.test(fileB);

  if (hasUnicodeA == hasUnicodeB) {
    // just compare alphabetically
    const fileA_ = fileA.slice(0, fileA.lastIndexOf('.'));
    const fileB_ = fileB.slice(0, fileB.lastIndexOf('.'));
    return fileA_ < fileB_ ? -1 : 1;
  } else {
    // map true to 0, because we want it to be first
    return ((hasUnicodeA ? 0 : 1) - (hasUnicodeB ? 0 : 1)) as -1 | 0 | 1;
  }
}
