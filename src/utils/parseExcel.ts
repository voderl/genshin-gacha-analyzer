/**
 * 解析Excel
 */
import { Data, DataItem } from 'types';
import XLSXNameSpace, { WorkBook } from 'xlsx/types';
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
  if (!('保底内' in template)) {
    let count = 1;
    formatters.push((item) => {
      item.保底内 = count++;
      if (item.星级 === 5) count = 1;
    });
  } else {
    formatters.push((item) => {
      if (typeof item.保底内 !== 'number') item.保底内 = parseInt(item.保底内);
    });
  }
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
      const data = XLSX.utils.sheet_to_json(sheet) as DataItem[];
      if (data.length !== 0) {
        const formatter = makeFormatter(data[0]);
        data.forEach((info, index) => {
          info.pool = (POOL_TYPE_TO_NAME as any)[type];
          info.date = +parseToDate(info.时间);
          info.总次数 = index + 1;
          formatter(info, index);
        });
      }
      (result as any)[type] = data;
    } else throw new Error(`cannot parse sheetName ${sheetName}`);
  });
  return result;
}
