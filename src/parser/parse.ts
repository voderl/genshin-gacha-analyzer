import { flatten, sortBy, mapValues, toPairs } from 'lodash';
import dayjs from 'dayjs';
import { DATA_INFO, POOL_TYPES } from 'const';
import { i18n } from 'utils/i18n';
import { TParsedItem, TSourceConfig, TSheets, TParsedData } from './type';

function parseItem(
  item: any,
  parser: TSourceConfig,
  currentSheet: TSheets[number],
): TParsedItem | false {
  if (typeof item !== 'object') return false;
  const parsed = parser.parseItem(item, currentSheet);
  if (typeof parsed !== 'object') return false;

  const { key, name, time } = parsed;
  if (!(key in DATA_INFO)) {
    throw new Error(`cannot parse item ${name}, key ${key}`);
  }
  const info = DATA_INFO[key];
  return {
    key,
    name,
    time,
    date: +dayjs(parsed.time),
    rarity: info.rarity,
    type: info.type,
  } as TParsedItem;
}

export function formatParsedData(parsedData: Omit<TParsedData, 'all'>): TParsedData {
  POOL_TYPES.forEach((key) => {
    const data = parsedData[key] || [];

    let pity = 1;

    data.forEach((item) => {
      item.poolType = key as keyof typeof parsedData;
      item.pity = pity++;
      if (item.rarity === 5) pity = 1;
    });
  });

  const allData = sortBy(flatten(Object.values(parsedData)), 'date');

  allData.forEach((item, index) => {
    item.total = index + 1;
  });

  return {
    ...parsedData,
    all: allData,
  };
}

export function parseSheets(rawSheets: TSheets, parsers: TSourceConfig[]) {
  const currentParser = parsers.find((parser) => parser.isCurrentSource(rawSheets));

  if (!currentParser) return i18n`没有在该文件中发现可以解析的内容`;
  console.log('current parser: ', currentParser.name);

  const sheets = currentParser.tranformSheets ? currentParser.tranformSheets(rawSheets) : rawSheets;

  const sheetNames = sheets.map((sheet) => sheet.name);

  const parsedSheets = currentParser.parseSheet(sheetNames, sheets);

  function parseSheet(sheetName: string) {
    const currentSheet = sheets.find((sheet) => sheet.name === sheetName);
    if (!currentSheet) return [];
    return currentSheet.data.map((item) => parseItem(item, currentParser!, currentSheet));
  }

  const parsedData = mapValues(parsedSheets, (sheets) => {
    const data = Array.isArray(sheets) ? flatten(sheets.map(parseSheet)) : parseSheet(sheets);

    return sortBy(data.filter((item) => !!item) as TParsedItem[], 'date');
  });

  return formatParsedData(parsedData);
}
