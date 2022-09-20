import { DataItem, TPoolType } from 'types';
import { i18n } from './i18n';

export { getItemNameByKey, getItemKeyFromName } from 'parser/utils';

export const isWeapon = (item: DataItem) => 'type' in item && item.type === 'weapon';

export function getPoolName(poolType: TPoolType) {
  const nameMap = {
    character: i18n`角色活动祈愿`,
    weapon: i18n`武器活动祈愿`,
    permanent: i18n`常驻祈愿`,
    novice: i18n`新手祈愿`,
  };
  return nameMap[poolType];
}
