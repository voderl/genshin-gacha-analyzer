import _ from 'lodash';
import { TSourceConfig } from '../type';
import { getItemKeyFromName } from 'parser/utils';

export default <TSourceConfig>{
  type: 'xlsx',
  name: 'normal',
  isCurrentSource(sheets) {
    const sheetNames = sheets.map((sheet) => sheet.name);
    return sheetNames.includes('角色活动祈愿') && sheets[0].headers.includes('名称');
  },
  parseSheet(sheetNames) {
    return {
      character: sheetNames.filter((sheetName) => sheetName.startsWith('角色活动祈愿')),
      weapon: '武器活动祈愿',
      permanent: '常驻祈愿',
      novice: '新手祈愿',
    };
  },
  parseItem(item) {
    const name = item['名称'];
    const key = getItemKeyFromName(name);
    if (key)
      return {
        key,
        time: item['时间'],
        name,
      };

    console.error('cannot find name', name);

    return false;
  },
};
