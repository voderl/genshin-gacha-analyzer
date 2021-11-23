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

/**
 * 是否逆序
 */
function isDescendingOrder(data: DataItem[]) {
  if (data.length === 0) return false;
  const diffData = data.slice(1).map((item, index) => item.date - data[index].date);
  let isDescending = false;
  // 如果只有十连且时间一样，则判定为 不是逆序
  for (let i = 0; i < diffData.length; i++) {
    const date = diffData[i];
    if (date < 0) isDescending = true;
    if (date > 0) return false;
  }
  return isDescending;
}

/**
 * 判断一个池子是否为 子池子，比如 "角色活动祈愿-2" 是 "角色活动祈愿" 的子池子
 */
function isChildSheet(parentSheetName: string, sheetName: string) {
  return sheetName != parentSheetName && sheetName.startsWith(parentSheetName);
}

export default function parseExcel(XLSX: typeof XLSXNameSpace, workbook: WorkBook) {
  const sheetsName = workbook.SheetNames;
  const sheets = workbook.Sheets;
  const result = {} as ExcelParsedObject;

  let parseAble = false;
  sheetsName.forEach((sheetName: string) => {
    if (sheetName in POOL_NAME_TO_TYPE) {
      parseAble = true;
      const type = (POOL_NAME_TO_TYPE as any)[sheetName];
      const sheet = sheets[sheetName];
      let data = XLSX.utils.sheet_to_json(sheet) as DataItem[];

      // 适配 "角色活动祈愿-2"，临时处理方案，此池子信息合并到 "角色活动祈愿" 池子
      const childSheetNames = sheetsName.filter((name) => isChildSheet(sheetName, name));

      let allChildData: DataItem[] = [];
      if (childSheetNames.length !== 0) {
        allChildData = flatten(
          childSheetNames.map((childSheetName) => {
            const childData = XLSX.utils.sheet_to_json(sheets[childSheetName]) as DataItem[];
            if (childData.length === 0) return childData;
            childData.forEach((info) => {
              info.pool = childSheetName;
              info.poolType = type;
              info.date = +parseToDate(info.时间);
              if (typeof info.星级 !== 'number') info.星级 = parseInt(info.星级);
            });
            if (isDescendingOrder(childData)) childData.reverse();
            return childData;
          }),
        );
      }

      // 只信任 抽卡数据里的 名称，日期，星级，其他数据按照时间顺序重新生成
      if (data.length !== 0) {
        const formatter = makeFormatter(data[0]);
        data.forEach((info, index) => {
          info.pool = (POOL_TYPE_TO_NAME as any)[type];
          info.poolType = type;
          info.date = +parseToDate(info.时间);
        });

        if (isDescendingOrder(data)) data.reverse();

        if (allChildData.length !== 0) data = data.concat(allChildData);

        data = sortBy(data, (item) => item.date);
        data.forEach(formatter);
      }
      (result as any)[type] = data;
    }
  });

  if (!parseAble) throw new Error('未在此文件中找到可被解析的数据');

  // 不信任"总次数"数据，重新生成
  sortBy(flatten(Object.values(result)), (item) => item.date).forEach((item, index) => {
    item.总次数 = index + 1;
  });
  return result;
}
