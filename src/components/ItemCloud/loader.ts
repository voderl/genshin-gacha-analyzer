import rarity3 from "resource/rarity_3_background.png";
import rarity4 from "resource/rarity_4_background.png";
import rarity5 from "resource/rarity_5_background.png";
import { getItemImageSrc } from "utils";

const rarityMap = {
  3: rarity3,
  4: rarity4,
  5: rarity5,
} as any;

const imageCache: {
  [key: string]: HTMLImageElement;
} = {};

type TListener = (img: HTMLImageElement) => void;

export const loader = {
  listeners: [] as TListener[],
  getImage(src: string) {
    if (src in imageCache && imageCache[src]) return imageCache[src];
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      this.listeners.forEach((listener) => listener(img));
      imageCache[src] = img;
      img.onload = null;
    };
    img.onerror = function (err) {
      console.error(err);
    };
    return null;
  },
  getBgFromRarity(rarity: number) {
    const src = rarityMap[rarity] || rarity3;
    return this.getImage(src);
  },
  getItemImageFromKey(key: string) {
    return this.getImage(getItemImageSrc(key));
  },
  addListener(listener: TListener) {
    this.listeners.push(listener);
  },
  removeListener(listener: TListener) {
    const idx = this.listeners.indexOf(listener);
    if (idx !== -1) this.listeners.splice(idx, 1);
  },
};
