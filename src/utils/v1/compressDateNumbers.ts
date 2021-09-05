import { createHuffmanUtils } from './huffman';
import { padStart } from './utils';

/**
 * 根据抽卡日期数据的特征进行某种压缩
 */
const MAX_LENGTH = 32; // 最长数据长度，大概100年
/**
 * 根据相应算法生成, 没有表明的中间值按照下一个长度处理
 */
const LENGTH_TO_HUFFMAN_CODE: any = {
  '4': '0',
  '6': '101',
  '8': '1000',
  '9': '110001',
  '13': '1001',
  '17': '111',
  '19': '1101',
  '21': '11001',
  '22': '1100001',
  '23': '11000001',
  '24': '110000001',
  '25': '1100000001',
  '32': '1100000000',
};

const HUFFMAN_CODE_TO_LENGTH: any = {};

Object.keys(LENGTH_TO_HUFFMAN_CODE).forEach((key) => {
  HUFFMAN_CODE_TO_LENGTH[LENGTH_TO_HUFFMAN_CODE[key]] = parseInt(key);
});

const lengthHuffmanUtils = createHuffmanUtils({ ...LENGTH_TO_HUFFMAN_CODE });

/**
 * 补全length
 */
let current: any;
for (let i = MAX_LENGTH; i >= 1; i--) {
  if (i in LENGTH_TO_HUFFMAN_CODE) current = LENGTH_TO_HUFFMAN_CODE[i];
  else LENGTH_TO_HUFFMAN_CODE[i] = current;
}

function getLength(v: number) {
  return (Math.log2(v) | 0) + 1;
}

export function decodeNumbers(str: string): number[] {
  const results: number[] = [];
  const len = str.length;
  const indexRef = {
    current: 0,
  };
  while (indexRef.current < len) {
    const numLength = parseInt(lengthHuffmanUtils.decodeOnce(str, indexRef));
    results.push(parseInt(str.slice(indexRef.current, indexRef.current + numLength), 2));
    indexRef.current += numLength;
  }
  return results;
}

export function encodeNumbers(numbers: number[]) {
  return numbers
    .map((v) => {
      const len = getLength(v);
      if (len in LENGTH_TO_HUFFMAN_CODE) {
        const code = LENGTH_TO_HUFFMAN_CODE[len];
        const matchLen = HUFFMAN_CODE_TO_LENGTH[code];
        return code + padStart(v.toString(2), matchLen, '0');
      }
      throw new Error(`cannot find key "${len}" in map`);
    })
    .join('');
}
