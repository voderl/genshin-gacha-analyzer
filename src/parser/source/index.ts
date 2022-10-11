import normalZhCnSource from './normal-zh-cn';
import paimonMoeSource from './paimon-moe';
import fallbackSource from './fallback';
import uigfJsonSource from './uigf-json';
import { TJsonSourceConfig, TXlsxSourceConfig } from '../type';

export const xlsxSourceList = [
  normalZhCnSource,
  paimonMoeSource,
  fallbackSource,
] as TXlsxSourceConfig[];

export const jsonSourceList = [uigfJsonSource] as TJsonSourceConfig<any>[];
