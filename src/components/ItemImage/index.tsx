import { FC } from 'react';
import { TParsedItem } from 'types';

export interface IItemImageProps {
  item: Pick<TParsedItem, 'name' | 'key' | 'rarity'>;
  size?: number;
}

const getItemSrc = (key: string) => {
  // return `./images/${key}.png`;
  return `https://genshin.voderl.cn/images/${key}.png`;
};

const ItemImage: FC<IItemImageProps> = function ({ item, size = 48 }) {
  return (
    <div className={`rarity-${item.rarity}`}>
      <img src={getItemSrc(item.key)} width={size} height={size} />
    </div>
  );
};

export default ItemImage;
