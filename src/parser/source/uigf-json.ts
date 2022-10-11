import _ from 'lodash';
import { getItemKeyFromName } from 'utils';
import { TJsonSourceConfig } from '../type';

type TPoolType = '100' | '200' | '301' | '302' | '400';

export default <
  TJsonSourceConfig<{
    info: {
      uid: string;
      lang: string;
      export_time: string;
      export_timestamp: number;
      export_app: string;
      export_app_version: string;
      uigf_version: string;
    };
    list: Array<{
      gacha_type: TPoolType;
      time: string;
      name: string;
      item_type: string;
      rank_type: string;
      id: string;
      uigf_gacha_type: TPoolType;
    }>;
  }>
>{
  type: 'json',
  name: 'uigf',
  isCurrentSource(data: any) {
    if (_.get(data, 'info.uigf_version')) return true;
    if ('list' in data && Array.isArray(data.list)) {
      const item = data.list[0];
      if (item && 'name' in item && 'gacha_type' in item) {
        return true;
      }
    }
    return false;
  },
  parseData(data) {
    const list = data.list;
    const formatItem = (item: typeof data.list[number]) => {
      const key = getItemKeyFromName(item.name);
      if (key) {
        return {
          key: key,
          name: item.name,
          time: item.time,
        };
      }
      console.error('cannot find name', item.name);
      return false;
    };

    const filterByPoolType = (poolType: TPoolType[]) => {
      return list
        .filter((item) => poolType.includes(item.gacha_type))
        .map(formatItem)
        .filter((v) => !!v);
    };

    return {
      character: filterByPoolType(['301', '400']),
      weapon: filterByPoolType(['302']),
      novice: filterByPoolType(['100']),
      permanent: filterByPoolType(['200']),
    };
  },
};
