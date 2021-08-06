import { DataItem } from 'types';
import { ExcelParsedObject } from 'utils/parseExcel';
import unionWith from 'lodash/unionWith';
import { POOL_TYPE_TO_NAME } from 'const';

// 同一文件内部不merge
function isSame(a: DataItem, b: DataItem) {
  return a.date === b.date && a.名称 === b.名称 && (a as any).own !== (b as any).own;
}
export default function mergeData(data: ExcelParsedObject[]) {
  const keys = Object.keys(POOL_TYPE_TO_NAME);
  const result = {} as any;
  keys.forEach((key) => {
    const list = unionWith<DataItem>(
      ...data.map((o: any) => {
        const data = o[key];
        data.forEach((v: any) => (v.own = o));
        return data;
      }),
      // @ts-ignore
      isSame,
    );
    list.sort((a, b) => a.date - b.date || a.总次数 - b.总次数);
    list.forEach((data, index) => {
      data.总次数 = index + 1;
    });
    result[key] = list;
  });
  return result as ExcelParsedObject;
}
