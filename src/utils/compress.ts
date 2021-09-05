/**
 * 进行压缩
 */
import { POOL_TYPE_TO_NAME } from 'const';
import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import { ExcelParsedObject } from './parseExcel';
import { decode, encode } from './v1';
import { padStart } from './v1/utils';

export function compressToHash(data: ExcelParsedObject) {
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

      sortBy(flatten(Object.values(data)), (item) => item.date).forEach(
        (item, index) => (item.总次数 = index + 1),
      );

      Object.keys(data).forEach((poolType: string) => {
        let count = 1;
        data[poolType as keyof ExcelParsedObject].forEach((item) => {
          item.时间 = formatToDate(item.date);
          item.pool = (POOL_TYPE_TO_NAME as any)[poolType];
          item.保底内 = count++;
          if (item.星级 === 5) count = 1;
        });
      });
      return data;
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}
