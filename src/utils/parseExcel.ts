/**
 * 解析Excel
 */
import { DataItem } from 'types';
import XLSXNameSpace, { WorkBook } from 'xlsx/types';
import parseToDate from './parseToDate';
import { POOL_NAME_TO_TYPE } from 'const';

export type ExcelParsedObject = {
  character: DataItem[];
  weapon: DataItem[];
  novice: DataItem[];
  permanent: DataItem[];
};

export default function parseExcel(XLSX: typeof XLSXNameSpace, workbook: WorkBook) {
  const sheetsName = workbook.SheetNames;
  const sheets = workbook.Sheets;
  const result = {} as ExcelParsedObject;
  sheetsName.forEach((sheetName: string) => {
    if (sheetName in POOL_NAME_TO_TYPE) {
      const type = (POOL_NAME_TO_TYPE as any)[sheetName];
      const sheet = sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet) as DataItem[];
      data.forEach((info, index) => {
        info.pool = sheetName;
        info.date = +parseToDate(info.时间);
        info.总次数 = index + 1;
        (['星级', '保底内'] as Array<keyof DataItem>).forEach((key) => {
          if (typeof info[key] !== 'number') (info as any)[key] = parseInt((info as any)[key]);
        });
      });
      (result as any)[type] = data;
    } else throw new Error(`cannot parse sheetName ${sheetName}`);
  });
  return result;
}
