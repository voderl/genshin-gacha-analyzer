const keyStrUriSafe = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~=`;
const mapping: any = {};

export const padStart = (s: string, length: number, char = '0') =>
  char.repeat(length - s.length) + s;

for (let i = 0; i < keyStrUriSafe.length; i++) {
  mapping[keyStrUriSafe.charAt(i)] = padStart(i.toString(2), 6, '0');
}

export function compressBinaryToEncodedURIComponent(str: string) {
  const space = (6 - ((str.length + 3) % 6)) % 6;
  // 转成code，再转成string
  const results = [];
  const formattedStr = str + '0'.repeat(space) + padStart(space.toString(2), 3, '0');
  for (let i = 0, len = formattedStr.length; i < len; ) {
    results.push(keyStrUriSafe.charAt(parseInt(formattedStr.slice(i, i + 6), 2)));
    i += 6;
  }
  return results.join('');
}

export function decompressBinaryFromEncodedURIComponent(str: string) {
  const chars = [];
  for (let i = 0, len = str.length; i < len; i++) {
    chars.push(mapping[str[i]]);
  }
  const binaryStrWithSpace = chars.join('');
  const spaceCount = parseInt(binaryStrWithSpace.slice(-3), 2);
  return binaryStrWithSpace.slice(0, -3 - spaceCount);
}
