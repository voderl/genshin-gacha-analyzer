import { PoolType, TLocales, TItemKeys, TPoolType } from 'types';
import isMobile from 'ismobilejs';
import dayjs from 'dayjs';

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
  { title: '时间', name: 'time', type: 'string', width: 200 },
  { title: '名称', name: 'name', type: 'string', width: 180 },
  {
    title: '类别',
    name: 'type',
    type: 'custom_item_type',
    width: 80,
  },
  { title: '星级', name: 'rarity', type: 'number', width: 50, filter: numberFilter },
  {
    title: '总次数',
    name: 'total',
    type: 'number',
    hidden: true,
    width: 100,
    filter: numberFilter,
  },
  { title: '保底内', name: 'pity', type: 'number', width: 80, filter: numberFilter },
];

export const SCHEMA_ALL = (SCHEMA as any).concat({
  title: '池子名称',
  name: 'poolType',
  type: 'custom_pool_type',
  width: 120,
});

export const CHARACTER_POOLS: PoolType[] = ((window as any).CHARACTER_POOLS || []).map((v: any) => {
  const o: PoolType = v as any;
  o.from = +dayjs(v.from);
  o.to = +dayjs(v.to);
  o.type = 'character';
  return o;
});
export const WEAPON_POOLS: PoolType[] = ((window as any).WEAPON_POOLS || []).map((v: any) => {
  const o: PoolType = v as any;
  o.from = +dayjs(v.from);
  o.to = +dayjs(v.to);
  o.type = 'weapon';
  return o;
});

export const LOCALES_DATA = (window as any).LOCALES_DATA as {
  [key in TLocales]: {
    [key in TItemKeys]: string;
  };
};

export const DATA_INFO = (window as any).DATA_INFO as {
  [key in TItemKeys]: {
    type: 'weapon' | 'character';
    rarity: number;
  };
};

export const POOL_TYPES: Array<TPoolType> = ['character', 'weapon', 'permanent', 'novice'];
