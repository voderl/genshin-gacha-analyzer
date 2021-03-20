import { message } from 'antd';

let id = 0;

export default function renderPngTip(func: (resolve: () => void, reject: () => void) => void) {
  const key = `${id++}`;
  message.loading({
    content: '生成图片中...',
    key,
  });
  const loading = new Promise(func as any);
  loading.then(
    () => {
      message.success({
        content: '生成图片成功',
        key,
      });
    },
    (e: any) => {
      console.log(e);
      message.error({
        content: '生成图片失败，请重试或更换浏览器',
        key,
      });
    },
  );
}
