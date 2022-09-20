import normalZhCnSource from './normal-zh-cn';
import paimonMoeSource from './paimon-moe';
import fallbackSource from './fallback';
import { TSourceConfig } from '../type';

export const sourceList: TSourceConfig[] = [normalZhCnSource, paimonMoeSource, fallbackSource];
