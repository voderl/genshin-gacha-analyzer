import { xlsxSourceList, jsonSourceList } from './source';
import { baseParseJson, parseSheets } from './parse';
import { zipObject } from 'lodash';
import { TSheets } from './type';
import type XLSXNameSpace from 'xlsx/types';

// @ts-ignore
// prefetch
import('xlsx/dist/xlsx.mini.min.js');

export function parseExcel(arrayBuffer: any) {
  // @ts-ignore
  return import('xlsx/dist/xlsx.mini.min.js').then((module) => {
    try {
      const XLSX: typeof XLSXNameSpace = module;
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array', cellText: false, cellDates: true });
      const sheets = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const arrayData = XLSX.utils.sheet_to_json<string[]>(sheet, {
          header: 1,
          raw: false,
          dateNF: 'yyyy-mm-dd HH:mm:ss',
        });
        const tabs = arrayData[0];
        const data = arrayData.slice(1).map((itemArray) => {
          const obj = zipObject(tabs, itemArray);
          (obj as any).__raw__ = itemArray;
          return obj;
        });
        return {
          name: sheetName,
          headers: arrayData[0] || [],
          data,
        };
      }) as TSheets;

      const parsedData = parseSheets(sheets, xlsxSourceList);

      if (typeof parsedData === 'string') return Promise.reject(parsedData);

      return parsedData;
    } catch (e: any) {
      console.error(e);
      return Promise.reject(e.message);
    }
  });
}

export function parseJson(data: any) {
  try {
    const parsedData = baseParseJson(data, jsonSourceList);
    if (typeof parsedData === 'string') throw new Error(parsedData);
    return parsedData;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
