export type TRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const isIntersect = (rect: TRect, otherRect: TRect) => {
  if (rect.x + rect.width <= otherRect.x) return false;
  if (rect.x >= otherRect.x + otherRect.width) return false;
  if (rect.y + rect.height <= otherRect.y) return false;
  if (rect.y >= otherRect.y + otherRect.height) return false;
  return true;
};

export const isInRect = (rect: TRect, point: { x: number; y: number }) => {
  if (point.x < rect.x) return false;
  if (point.x > rect.x + rect.width) return false;
  if (point.y < rect.y) return false;
  if (point.y > rect.y + rect.height) return false;
  return true;
};

export const limitRectInContainer = (rect: TRect, container: TRect): TRect => {
  const width = Math.min(rect.width, container.width);
  const height = Math.min(rect.height, rect.width);
  return {
    x: Math.min(
      Math.max(rect.x, container.x),
      container.x + container.width - width
    ),
    y: Math.min(
      Math.max(rect.y, container.y),
      container.y + container.height - height
    ),
    width,
    height,
  };
};

export const moveToLast = <T = any>(item: T, itemList: T[]) => {
  const idx = itemList.indexOf(item);
  if (idx !== -1) {
    itemList.splice(idx, 1);
    itemList.push(item);
  }
};
