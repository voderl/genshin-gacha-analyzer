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
