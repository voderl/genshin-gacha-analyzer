import { DataItem } from 'types';
import { ExcelParsedObject } from 'utils/parseExcel';
import unionWith from 'lodash/unionWith';
import sortBy from 'lodash/sortBy';
import flatten from 'lodash/flatten';
import { POOL_TYPE_TO_NAME } from 'const';

// 同一文件内部不merge
function isSame(a: DataItem, b: DataItem) {
  return a.date === b.date && a.名称 === b.名称 && (a as any).own !== (b as any).own;
}
export default function mergeData(data: ExcelParsedObject[]) {
  const keys = Object.keys(POOL_TYPE_TO_NAME);
  const result = {} as any;
  keys.forEach((key) => {
    const list = sortBy(
      unionWith<DataItem>(
        flatten(
          data.map((o: any) => {
            const poolData = o[key];
            poolData.forEach((v: any) => (v.own = o));
            return poolData as DataItem[];
          }),
        ),
        // @ts-ignore
        isSame,
      ),
      (item) => item.date,
    );
    let count = 1;
    list.forEach((data) => {
      data.保底内 = count++;
      if (data.星级 === 5) count = 1;
    });
    result[key] = list;
  });
  sortBy(flatten(Object.values(result as ExcelParsedObject)), (item) => item.date).forEach(
    (item, index) => (item.总次数 = index + 1),
  );
  return result as ExcelParsedObject;
}
