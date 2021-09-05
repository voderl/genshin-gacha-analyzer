/**
 * 将日期按照顺序差分成日期数据数组进行压缩
 */
import { decodeNumbers, encodeNumbers } from './compressDateNumbers';

const START_DATE = 1600120800;
/**
 * 解密
 */
export function decodeDate(str: string): number[] {
  const numbers = decodeNumbers(str);
  const dates: number[] = [];
  let currentDate = START_DATE;
  for (let i = 0, len = numbers.length; i < len; i++) {
    currentDate += numbers[i];
    dates.push(currentDate);
  }
  return dates.map((v) => 1000 * v);
}

/**
 * 加密
 */
export function encodeDate(_dates: number[]) {
  const dates = _dates.map((date) => date / 1000);
  const dDates = [dates[0] - START_DATE].concat(dates.slice(1).map((v, index) => v - dates[index]));
  return encodeNumbers(dDates);
}
