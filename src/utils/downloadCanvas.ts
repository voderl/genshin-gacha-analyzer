// @ts-ignore
import * as download from 'downloadjs';
/**
 * 下载canvas为图片，手机部分浏览器不支持 createObjectUrl 等
 */
const userAgent = window.navigator.userAgent;
const IS_XIAOMI_BROWSER = userAgent.indexOf('MiuiBrowser') > -1;
export default function downloadCanvas(
  canvas: HTMLCanvasElement,
  name: string,
  callback?: () => void,
) {
  if (IS_XIAOMI_BROWSER) {
    canvas.toBlob((blob) => {
      download(blob, name);
      callback && callback();
    });
  } else {
    download(canvas.toDataURL(), name);
    callback && callback();
  }
}
