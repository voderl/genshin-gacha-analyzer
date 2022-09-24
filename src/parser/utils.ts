import { message } from 'antd';
import { LOCALES_DATA } from 'const';
import { invert, mapValues, merge, values } from 'lodash';
import { TLocales } from './type';

const NAME_TO_KEY_LOCALES = mapValues(LOCALES_DATA, (data) => invert(data));

const NAME_TO_KEY_ALL = merge.apply(null, values(NAME_TO_KEY_LOCALES) as any);

export function getItemKeyFromName(name: string, locale?: TLocales): string {
  const data = locale && locale in LOCALES_DATA ? NAME_TO_KEY_LOCALES[locale] : NAME_TO_KEY_ALL;

  if (name in data) return data[name];

  console.error('cannot find key', name);

  return '';
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const urlLocale: TLocales | null = urlParams.get('locale') as any;
if (urlLocale && !(urlLocale in LOCALES_DATA)) {
  message.error('locale should be ' + Object.keys(LOCALES_DATA).join(','), 10);
}

export function getItemNameByKey(key: string, locale?: TLocales) {
  const currentLocale: TLocales = locale
    ? locale
    : urlLocale && urlLocale in LOCALES_DATA
    ? urlLocale
    : 'ChineseSimplified';
  const localesData = LOCALES_DATA[currentLocale];

  if (key in localesData) return localesData[key];

  console.error('cannot find key', key);

  return 'unknown';
}
