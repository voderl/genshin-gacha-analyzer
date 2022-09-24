import _ from 'lodash';
import { getItemKeyFromName, getItemNameByKey } from 'utils';
import { TSourceConfig } from '../type';

export default <TSourceConfig>{
  name: 'paimon-moe',
  isCurrentSource(sheets) {
    const characterSheet = sheets.find((sheet) => sheet.name === 'Character Event');
    if (!characterSheet) return false;
    const headers = characterSheet.headers;
    return headers.includes('⭐');
  },
  parseSheet() {
    return {
      character: 'Character Event',
      weapon: 'Weapon Event',
      permanent: 'Standard',
      novice: `Beginners' Wish`,
    };
  },
  parseItem(item) {
    const name = item['Name'];
    const key = getItemKeyFromName(name);
    if (key)
      return {
        key,
        time: item['Time'],
        name,
      };

    console.error('cannot find name', name);

    return false;
  },
};
