// @ts-ignore
import * as download from 'downloadjs';
/**
 * 下载canvas为图片，手机部分浏览器不支持 createObjectUrl 等
 */
export default function downloadCanvas(
  canvas: HTMLCanvasElement,
  name: string,
  callback?: () => void,
) {
  download(canvas.toDataURL(), name);
  callback && callback();
}
