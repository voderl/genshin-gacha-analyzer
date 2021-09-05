import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import { DataItem } from 'types';
import { ExcelParsedObject } from 'utils/parseExcel';
import { decodeDataItem, encodeDataItem } from './compressDataItem';
import { decodeDate, encodeDate } from './compressDate';
import { createHuffmanUtils } from './huffman';
import {
  compressBinaryToEncodedURIComponent,
  decompressBinaryFromEncodedURIComponent,
} from './utils';

/**
 * 控制字符包括 设定抽的池子，
 */
enum ControlAction {
  matchOne = '0', // 单抽 或者 十连
  matchTen = '1',
  changePool = '2', // 换池子
}

const ControlActionMap = {
  [ControlAction.matchOne]: '1',
  [ControlAction.matchTen]: '01',
  [ControlAction.changePool]: '001',
};

const controlActionUtils = createHuffmanUtils(ControlActionMap);

const PoolTypeMap = {
  character: '11',
  weapon: '101',
  novice: '100',
  permanent: '0',
} as any;
const poolTypeUtils = createHuffmanUtils(PoolTypeMap);

const SEPARATOR = ':'; // 压缩时没用到的字符
const VERSION = 1;

function encodeChangePool(poolType: string) {
  return (
    controlActionUtils.encodeOnce(ControlAction.changePool) + poolTypeUtils.encodeOnce(poolType)
  );
}

export function encode(data: ExcelParsedObject) {
  console.log('encode');

  const allDataItem = sortBy(flatten(Object.values(data)), (item) => item.date);

  const dates = [];
  const dataStrArr = [];
  let currentPool = '';
  function walk(item: DataItem) {
    dataStrArr.push(encodeDataItem(item));
  }
  for (let i = 0, len = allDataItem.length; i < len; ) {
    const current = allDataItem[i];
    if (current.poolType !== currentPool) {
      currentPool = current.poolType;
      dataStrArr.push(encodeChangePool(currentPool));
    }
    dates.push(current.date);

    if (i < len - 1 && allDataItem[i + 1].date === current.date) {
      dataStrArr.push(controlActionUtils.encodeOnce(ControlAction.matchTen));
      allDataItem.slice(i, i + 10).forEach(walk);
      i = i + 10;
    } else {
      dataStrArr.push(controlActionUtils.encodeOnce(ControlAction.matchOne));
      walk(current);
      i++;
    }
  }
  const encodedDateStr = encodeDate(dates);

  return (
    compressBinaryToEncodedURIComponent(encodedDateStr) +
    SEPARATOR +
    compressBinaryToEncodedURIComponent(dataStrArr.join('')) +
    SEPARATOR +
    VERSION
  );
}

export function decode(str: string): ExcelParsedObject {
  console.log('decode');

  const splitSegs = str.split(SEPARATOR);
  const [_encodedDateStr, encodedDataStr] = splitSegs
    .slice(0, 2)
    .map(decompressBinaryFromEncodedURIComponent);
  const dates = decodeDate(_encodedDateStr);

  const data = {
    character: [],
    weapon: [],
    novice: [],
    permanent: [],
  } as any;

  const indexRef = {
    current: 0,
  };
  const len = encodedDataStr.length;
  let currentPool = '';
  while (indexRef.current < len) {
    let action = controlActionUtils.decodeOnce(encodedDataStr, indexRef);
    if (action === ControlAction.matchOne) {
      const item = decodeDataItem(encodedDataStr, indexRef);
      item.date = dates.shift();
      data[currentPool].push(item);
    } else if (action === ControlAction.matchTen) {
      const date = dates.shift();
      for (let i = 0; i < 10; i++) {
        const item = decodeDataItem(encodedDataStr, indexRef);
        item.date = date;
        data[currentPool].push(item);
      }
    } else if (action === ControlAction.changePool) {
      currentPool = poolTypeUtils.decodeOnce(encodedDataStr, indexRef);
    } else {
      throw new Error('unmatched action');
    }
  }
  if (dates.length !== 0) {
    // 十连的时间其实可能并不完全相同，这时有可能造成时间匹配错位？
    console.log(dates);
    console.error(new Error('dates match error'));
    // throw new Error('dates match error');
  }
  return data;
}
