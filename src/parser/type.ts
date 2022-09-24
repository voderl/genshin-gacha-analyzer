export type TLocales = [
  'ChineseSimplified',
  'ChineseTraditional',
  'English',
  'French',
  'German',
  'Indonesian',
  'Japanese',
  'Korean',
  'Portuguese',
  'Russian',
  'Spanish',
  'Thai',
  'Vietnamese',
][number];

export type TItemKeys = string;

export type TParsedData = {
  character: TParsedItem[];
  weapon: TParsedItem[];
  permanent: TParsedItem[];
  novice: TParsedItem[];
  all: TParsedItem[];
};

export type TParsedItem = {
  key: string;
  date: number;
  time: string;
  name: string;
  type: 'weapon' | 'character';
  poolType: 'character' | 'weapon' | 'permanent' | 'novice';
  rarity: number;
  total: number;
  pity: number;
};

export type TItem = {
  key: string;
  time: string;
  name: string;
  type?: 'weapon' | 'character';
  rarity?: string | number;
};

export type TSheets = Array<{
  name: string;
  headers: string[];
  data: Array<
    {
      [key: string]: string;
    } & {
      __raw__: string[];
    }
  >;
}>;

export type TSourceConfig = {
  name: string;
  /**
   * is use current parser to parse data
   */
  isCurrentSource: (sheets: TSheets) => boolean;
  /**
   * transform sheets before parse
   */
  tranformSheets?: (sheets: TSheets) => TSheets;
  /**
   * parse sheetName to actual pools type
   */
  parseSheet: (
    sheetNames: string[],
    sheets: TSheets,
  ) => {
    character: string | string[];
    weapon: string | string[];
    permanent: string | string[];
    novice: string | string[];
  };
  /**
   * if return false, this item will be ignored.
   */
  parseItem: (
    item: TSheets[number]['data'][number],
    currentSheet: TSheets[number],
  ) => TItem | false;
};
