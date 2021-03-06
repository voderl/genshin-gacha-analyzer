import { DataItem } from 'types';

export const isWeapon = (item: DataItem) => item.类别 === '武器';
