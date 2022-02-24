import { PoolType } from 'types';
import isMobile from 'ismobilejs';
import parseToDate from 'utils/parseToDate';
import invert from 'lodash/invert';

(window as any).version = '1.0.9';

export const DEVICE = isMobile(window.navigator);

export const ISMOBILE = DEVICE.any;

export const SHOW_DATA_ALL_KEY = '总览';

export const FONT_FAMILY = 'HYWenHei-65W';
export const FONT_FAMILY_BOLD = 'HYWenHei-85W';

export const COLOR = {
  FOUR_STAR: '#A65FE2',
  FIVE_STAR: '#C0713D',
  THREE_STAR: '#4D8DF7',
};
// fix: canvas-datagrid have error when filter number
const numberFilter = function (value: number, filterFor: string | undefined) {
  if (!filterFor) {
    return true;
  }
  return value.toString() === filterFor;
};
export const SCHEMA = [
  { name: '时间', type: 'string', width: 200 },
  { name: '编号', type: 'number', hidden: true, width: 120, filter: numberFilter },
  { name: '名称', type: 'string', width: 130 },
  { name: '类别', type: 'string', width: 50 },
  { name: '星级', type: 'number', width: 50, filter: numberFilter },
  { name: '总次数', type: 'number', hidden: true, width: 100, filter: numberFilter },
  { name: '保底内', type: 'number', width: 80, filter: numberFilter },
];

export const SCHEMA_ALL = (SCHEMA as any).concat({
  name: 'pool',
  title: '池子名称',
  type: 'string',
  width: 120,
});

export const CHARACTER_POOLS: PoolType[] = ((window as any).CHARACTER_POOLS || []).map((v: any) => {
  const o: PoolType = v as any;
  o.from = +parseToDate(v.from);
  o.to = +parseToDate(v.to);
  o.type = 'character';
  return o;
});
export const WEAPON_POOLS: PoolType[] = ((window as any).WEAPON_POOLS || []).map((v: any) => {
  const o: PoolType = v as any;
  o.from = +parseToDate(v.from);
  o.to = +parseToDate(v.to);
  o.type = 'weapon';
  return o;
});

export const BASE_POOL_NAME_TO_TYPE = {
  角色活动祈愿: 'character',
  武器活动祈愿: 'weapon',
  常驻祈愿: 'permanent',
  新手祈愿: 'novice',
};
export const POOL_TYPE_TO_NAME = invert(BASE_POOL_NAME_TO_TYPE);

export const POOL_NAME_TO_TYPE = {
  ...BASE_POOL_NAME_TO_TYPE,
  301: 'character',
  302: 'weapon',
  200: 'permanent',
  100: 'novice',
};
