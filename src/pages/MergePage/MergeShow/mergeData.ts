import { DataItem, TParsedData } from 'types';
import unionWith from 'lodash/unionWith';
import sortBy from 'lodash/sortBy';
import flatten from 'lodash/flatten';
import { POOL_TYPES } from 'const';
import { formatParsedData } from 'parser/parse';

// 同一文件内部不merge
function isSame(a: DataItem, b: DataItem) {
  return a.date === b.date && a.name === b.name && (a as any).own !== (b as any).own;
}
export default function mergeData(data: TParsedData[]) {
  const result = {} as any;
  POOL_TYPES.forEach((key) => {
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
    result[key] = list;
  });

  return formatParsedData(result);
}
