import { FC } from 'react';
import { TParsedItem } from 'types';
import { getItemImageSrc } from 'utils';

export interface IItemImageProps {
  item: Pick<TParsedItem, 'name' | 'key' | 'rarity'>;
  size?: number;
}


const ItemImage: FC<IItemImageProps> = function ({ item, size = 48 }) {
  return (
    <div className={`rarity-${item.rarity}`}>
      <img src={getItemImageSrc(item.key)} width={size} height={size} />
    </div>
  );
};

export default ItemImage;
