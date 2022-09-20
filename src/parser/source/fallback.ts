import _ from 'lodash';
import { TSourceConfig } from '../type';
import { getItemKeyFromName } from 'parser/utils';
import dayjs from 'dayjs';

const characterPoolNames = [
  '角色活动祈愿',
  '角色活動祈願',
  'Character Event Wish',
  'イベント祈願・キャラクター',
];
const weaponPoolNames = ['武器活动祈愿', '武器活動祈願', 'Weapon Event Wish', 'イベント祈願・武器'];
const permanentPoolNames = ['常驻祈愿', '常駐祈願', 'Permanent Wish', '通常祈願'];
const novicePoolNames = ['新手祈愿', '新手祈願', 'Novice Wishes', '初心者向け祈願'];

export default <TSourceConfig>{
  name: 'fallback',
  isCurrentSource(sheets) {
    return !!sheets.find((currentSheet) => {
      const timeKey = currentSheet.headers[0];
      const nameKey = currentSheet.headers[1];
      return !!currentSheet.data.find((item) => {
        const time = item[timeKey];
        const name = item[nameKey];
        return dayjs(time).isValid() && !!getItemKeyFromName(name);
      });
    });
  },
  parseSheet(sheetNames) {
    return {
      character: sheetNames.find((v) => characterPoolNames.includes(v)) || sheetNames[0],
      weapon: sheetNames.find((v) => weaponPoolNames.includes(v)) || sheetNames[1],
      permanent: sheetNames.find((v) => permanentPoolNames.includes(v)) || sheetNames[2],
      novice: sheetNames.find((v) => novicePoolNames.includes(v)) || sheetNames[3],
    };
  },
  parseItem(item, currentSheet) {
    const timeKey = currentSheet.headers[0];
    const nameKey = currentSheet.headers[1];
    const name = item[nameKey];
    const key = getItemKeyFromName(name);
    if (key)
      return {
        key,
        time: item[timeKey],
        name,
      };

    console.error('cannot find name', name);

    return false;
  },
};
