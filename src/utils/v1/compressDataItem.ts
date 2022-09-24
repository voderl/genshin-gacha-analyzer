/**
 * 每条抽卡数据的 decode 和 encode ，不包括日期
 */
import { CHARACTER_POOLS, WEAPON_POOLS } from 'const';
import { uniq } from 'lodash';
import { DataItem } from 'types';
import { createHuffmanUtils } from './huffman';
import { IndexRefType } from './types';
import { padStart } from './utils';

/**
 * 需保证添加新角色，不更改原有的编码
 */
function buildHuffmanTree(data: string[], bit = 4) {
  // 同级15个，最后一个向下延伸再15个，一直延伸
  let prefix = '';
  const map = {} as any;
  while (data.length !== 0) {
    const segs = data.splice(0, Math.pow(2, bit) - 1);
    segs.forEach((key, index) => (map[key] = prefix + padStart(index.toString(2), bit, '0')));
    prefix += '1'.repeat(bit);
  }
  return createHuffmanUtils(map);
}

export const CHARACTER = 'character';
export const WEAPON = 'weapon';

enum ItemType {
  Weapon3, // 13
  Weapon4, // 22
  Weapon5, // 17
  Character4, // 18
  Character5, // 14
}

const ItemTypeMap = {
  [ItemType.Weapon3]: '1',
  [ItemType.Weapon4]: '001',
  [ItemType.Weapon5]: '0000',
  [ItemType.Character4]: '01',
  [ItemType.Character5]: '0001',
};

const itemTypeHuffmanUtils = createHuffmanUtils(ItemTypeMap);

// 为不影响之前的编码，只允许后续追加条目
export const treeData = {
  [ItemType.Weapon3]: {
    extra: {
      star: 3,
      type: WEAPON,
    },
    tree: buildHuffmanTree([
      'emeraldorb',
      'debateclub',
      'ravenbow',
      'skyridersword',
      'bloodtaintedgreatsword',
      'blacktassel',
      'magicguide',
      'sharpshootersoath',
      'slingshot',
      'ferrousshadow',
      'harbingerofdawn',
      'coolsteel',
      'thrillingtalesofdragonslayers',
    ]),
  },
  [ItemType.Weapon4]: {
    extra: {
      star: 4,
      type: WEAPON,
    },
    tree: buildHuffmanTree(
      uniq(WEAPON_POOLS.reduce((acc, cur) => acc.push(...cur.four) && acc, [] as any)),
    ),
  },
  [ItemType.Weapon5]: {
    extra: {
      type: WEAPON,
      star: 5,
    },
    tree: buildHuffmanTree(
      uniq(WEAPON_POOLS.reduce((acc, cur) => acc.push(...cur.five) && acc, [] as any)),
    ),
  },
  [ItemType.Character4]: {
    extra: {
      type: CHARACTER,
      star: 4,
    },
    tree: buildHuffmanTree(
      uniq(
        ['lisa', 'kaeya', 'amber'].concat(
          CHARACTER_POOLS.reduce((acc, cur) => acc.push(...cur.four) && acc, [] as any),
        ),
      ),
    ),
  },
  [ItemType.Character5]: {
    extra: {
      type: CHARACTER,
      star: 5,
    },
    tree: buildHuffmanTree(
      uniq(
        ['diluc', 'mona', 'keqing', 'jean', 'qiqi'].concat(
          CHARACTER_POOLS.reduce((acc, cur) => acc.push(...cur.five) && acc, [] as any),
        ),
      ),
    ),
  },
} as const;

const mapping = {
  [CHARACTER]: {
    4: ItemType.Character4,
    5: ItemType.Character5,
  },
  [WEAPON]: {
    3: ItemType.Weapon3,
    4: ItemType.Weapon4,
    5: ItemType.Weapon5,
  },
} as any;

function formatToItemType(data: DataItem) {
  const star = data.rarity;
  const type = data.type;
  return mapping[type][star] as ItemType;
}
function parseFromItemType(itemType: ItemType) {
  const { star, type } = treeData[itemType].extra;
  return {
    rarity: star,
    type: type,
  };
}
export function encodeDataItem(data: DataItem) {
  const itemType = formatToItemType(data);
  const { encodeOnce } = treeData[itemType].tree;
  return ItemTypeMap[itemType] + encodeOnce(data.key);
}

export function decodeDataItem(str: string, indexRef: IndexRefType): Partial<DataItem> {
  const itemType: ItemType = itemTypeHuffmanUtils.decodeOnce(str, indexRef);
  const key = treeData[itemType].tree.decodeOnce(str, indexRef);
  return {
    key,
    ...parseFromItemType(itemType),
  };
}
