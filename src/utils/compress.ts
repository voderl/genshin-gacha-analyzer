/**
 * 进行压缩
 */
import { formatParsedData } from 'parser/parse';
import { TParsedData } from 'parser/type';
import { getItemNameByKey } from 'parser/utils';
import { decode, encode } from './v1';
import { padStart } from './v1/utils';

export function compressToHash(data: TParsedData) {
  try {
    const hash = encode(data);
    const location = window.location;
    const newurl = `${location.protocol}//${location.host}${location.pathname}#${hash}`;
    window.history.replaceState(
      {
        path: newurl,
      },
      '',
      newurl,
    );
  } catch (e) {
    console.error(e);
    window.location.hash = '';
  }
}

const pad2 = (s: string | number) => padStart('' + s, 2, '0');
function formatToDate(dateNum: number) {
  const date = new Date(dateNum);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(
    date.getHours(),
  )}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

export function decompressFromHash() {
  try {
    const location = window.location;
    if (location.hash) {
      const hash = location.hash.slice(1);
      const data = decode(hash);
      const parsedData = formatParsedData(data);

      parsedData.all.forEach((item) => {
        item.name = getItemNameByKey(item.key);
        item.time = formatToDate(item.date);
      });

      return parsedData;
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}
