/**
 * 解析Excel
 */
import { Data, DataItem } from 'types';
import XLSXNameSpace, { WorkBook } from 'xlsx/types';
import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import parseToDate from './parseToDate';
import { POOL_NAME_TO_TYPE, POOL_TYPE_TO_NAME } from 'const';

export type ExcelParsedObject = {
  character: DataItem[];
  weapon: DataItem[];
  novice: DataItem[];
  permanent: DataItem[];
};

function makeFormatter(template: DataItem) {
  const formatters: Array<(item: DataItem, index?: number) => void> = [
    (item) => {
      if (typeof item.星级 !== 'number') item.星级 = parseInt(item.星级);
    },
  ];
  // 抽卡记录合并可能会导致保底内数据重置，在此不信任"保底内"数据，重新生成
  let count = 1;
  formatters.push((item) => {
    item.保底内 = count++;
    if (item.星级 === 5) count = 1;
  });
  return (item: DataItem, index: number) => {
    formatters.forEach((formatter) => formatter(item, index));
    return item;
  };
}

export default function parseExcel(XLSX: typeof XLSXNameSpace, workbook: WorkBook) {
  const sheetsName = workbook.SheetNames;
  const sheets = workbook.Sheets;
  const result = {} as ExcelParsedObject;
  sheetsName.forEach((sheetName: string) => {
    if (sheetName in POOL_NAME_TO_TYPE) {
      const type = (POOL_NAME_TO_TYPE as any)[sheetName];
      const sheet = sheets[sheetName];
      let data = XLSX.utils.sheet_to_json(sheet) as DataItem[];
      // 只信任 抽卡数据里的 名称，日期，星级，其他数据按照时间顺序重新生成
      if (data.length !== 0) {
        const formatter = makeFormatter(data[0]);
        data.forEach((info, index) => {
          info.pool = (POOL_TYPE_TO_NAME as any)[type];
          info.poolType = type;
          info.date = +parseToDate(info.时间);
        });
        data = sortBy(data, (item) => item.date);
        data.forEach(formatter);
      }
      (result as any)[type] = data;
    } else throw new Error(`cannot parse sheetName ${sheetName}`);
  });
  // 不信任"总次数"数据，重新生成
  sortBy(flatten(Object.values(result)), (item) => item.date).forEach((item, index) => {
    item.总次数 = index + 1;
  });
  return result;
}
