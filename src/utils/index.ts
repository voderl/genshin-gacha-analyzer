import { DataItem, TPoolType } from "types";
import { i18n } from "./i18n";

export { getItemNameByKey, getItemKeyFromName } from "parser/utils";

export const isWeapon = (item: DataItem) =>
  "type" in item && item.type === "weapon";

export function getPoolName(poolType: TPoolType) {
  const nameMap = {
    character: i18n`角色活动祈愿`,
    weapon: i18n`武器活动祈愿`,
    permanent: i18n`常驻祈愿`,
    novice: i18n`新手祈愿`,
  };
  return nameMap[poolType];
}

export function getItemImageSrc(key: string) {
  // return `./images/${key}.png`;
  return `https://genshin.voderl.cn/images256/${key}.png`;
}

function drawRoundRectPath(
  cxt: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number
) {
  cxt.beginPath();
  //从右下角顺时针绘制，弧度从0到1/2PI
  cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
  //矩形下边线
  cxt.lineTo(radius, height);
  //左下角圆弧，弧度从1/2PI到PI
  cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
  //矩形左边线
  cxt.lineTo(0, radius);
  //左上角圆弧，弧度从PI到3/2PI
  cxt.arc(radius, radius, radius, Math.PI, (Math.PI * 3) / 2);
  //上边线
  cxt.lineTo(width - radius, 0);
  //右上角圆弧
  cxt.arc(width - radius, radius, radius, (Math.PI * 3) / 2, Math.PI * 2);
  //右边线
  cxt.lineTo(width, height - radius);
  cxt.closePath();
}

function strokeRoundRect(
  cxt: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  lineWidth: number,
  strokeColor?: string
) {
  //圆的直径必然要小于矩形的宽高
  if (2 * radius > width || 2 * radius > height) {
    return false;
  }

  cxt.save();
  cxt.translate(x, y);
  //绘制圆角矩形的各个边
  drawRoundRectPath(cxt, width, height, radius);
  cxt.lineWidth = lineWidth || 2; //若是给定了值就用给定的值否则给予默认值2
  cxt.strokeStyle = strokeColor || "#000";
  cxt.stroke();
  cxt.restore();
}

export function fillRoundRect(
  cxt: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor?: string
) {
  if (2 * radius > width || 2 * radius > height) {
    return false;
  }
  cxt.save();
  cxt.translate(x, y);
  drawRoundRectPath(cxt, width, height, radius);
  cxt.fillStyle = fillColor || "#000";
  cxt.fill();
  cxt.restore();
}

export function fillImageRoundRect(
  cxt: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  image: CanvasImageSource,
  sx: number,
  sy: number,
  swidth: number,
  sheight: number
) {
  if (2 * radius > width || 2 * radius > height) {
    return false;
  }
  cxt.save();
  cxt.translate(x, y);
  drawRoundRectPath(cxt, width, height, radius);
  cxt.clip();
  cxt.drawImage(image, sx, sy, swidth, sheight, 0, 0, width, height);
  cxt.restore();
}
