import { reject } from 'lodash';
import qs from 'query-string';
import XLSXNameSpace from 'xlsx/types';
// @ts-ignore
import saveAs from 'file-saver';
// mihoyo api
export type Message = { type: 'error' | 'warning' | 'info'; text: string };
type Log = (data: Message) => void;
const emptyLog = (data: Message) => void 0;
const logRef: {
  current: Log;
} = {
  current: emptyLog,
};
const message = {
  info: (text: string) =>
    logRef.current({
      type: 'info',
      text,
    }),
  warning: (text: string) =>
    logRef.current({
      type: 'warning',
      text,
    }),
  error: (text: string) =>
    logRef.current({
      type: 'error',
      text,
    }),
};
type Info = {
  apiDomain: string;
  query: {
    [key: string]: string | number;
  };
};
export default function parseUrl(inputUrl: string, log?: Log) {
  try {
    if (log) logRef.current = log;
    else logRef.current = emptyLog;
    let apiDomain = 'https://hk4e-api.mihoyo.com';
    const { url, query } = qs.parseUrl(inputUrl);
    if (url.includes('webstatic-sea') || url.includes('hk4e-api-os'))
      apiDomain = 'https://hk4e-api-os.mihoyo.com';
    if (!('authkey' in query)) return message.error('未在url中发现authkey');
    ['page', 'size', 'gacha_type', 'end_id'].forEach((key) => {
      if (key in query) delete query[key];
    });
    query.lang = 'zh-cn';
    const info = {
      apiDomain,
      query,
    };
    return () => {
      main(info as any);
    };
  } catch (e) {
    message.error('输入内容解析错误，请重新输入');
  }
}

const wishTypeMap = {
  '301': '角色活动祈愿',
  '302': '武器活动祈愿',
  '200': '常驻祈愿',
  '100': '新手祈愿',
};

function main(info: Info) {
  message.info('加载XLSX解析文件中...');
  // @ts-ignore
  import('xlsx/dist/xlsx.mini.min.js')
    .then((module) => {
      const XLSX: typeof XLSXNameSpace = module;
      const workbook = XLSX.utils.book_new();
      const title = ['时间', '名称', '类别', '星级', '总次数', '保底内'];
      getGachaType(info).then((types: any) => {
        Promise.all(
          types.map((type: any) => {
            const { name, key } = type;
            return getGachaLogs(info, name, key).then((list: any) => {
              let pdx = 0;
              const data = list.map((item: any, index: number) => {
                pdx++;
                const star = parseInt(item.rank_type);
                if (star === 5) pdx = 0;
                return [item.time, item.name, item.item_type, star, index + 1, pdx];
              });
              data.unshift(title);
              const ws = XLSX.utils.aoa_to_sheet(data);
              XLSX.utils.book_append_sheet(workbook, ws, name);
            });
          }),
        ).then(() => {
          const wbout = XLSX.write(workbook, { bookType: 'xlsx', bookSST: false, type: 'array' });
          saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'test.xlsx');
        });
      });
    })
    .catch(() => {
      message.error('XLSX解析文件加载失败，请重试');
    });
}
// function fetch() {
//   return new Promise((resolve, reject) => resolve)
// }
function request(
  baseUrl: string,
  params: {
    [key: string]: string | number;
  },
) {
  const left = 3;
  const retryDelay = 100;
  const url = qs.stringifyUrl({
    url: baseUrl,
    query: params,
  });
  return new Promise((resolve, reject) => {
    function wrappedFetch(attempt: number) {
      fetch(url, {
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      })
        .then(function (response) {
          console.log(response);
          resolve(response.json());
        })
        .catch(function (e) {
          if (++attempt >= left) reject(e);
          else {
            setTimeout(() => {
              wrappedFetch(attempt);
            }, retryDelay);
          }
        });
    }
    wrappedFetch(0);
  });
}

const order = ['301', '302', '200', '100'];
function getGachaType(info: Info) {
  return new Promise((resolve, reject) => {
    message.info('获取祈愿类型中...');
    request(`${info.apiDomain}/event/gacha_info/api/getConfigList`, info.query)
      .then((res: any) => {
        const gachaTypes = res.data.gacha_type_list;
        const orderedGachaTypes = [];
        order.forEach((key) => {
          const index = gachaTypes.findIndex((item: any) => item.key === key);
          if (index !== -1) {
            orderedGachaTypes.push(gachaTypes.splice(index, 1)[0]);
          }
        });
        orderedGachaTypes.push(...gachaTypes);
        resolve(orderedGachaTypes);
      })
      .catch((e) => {
        message.error('获取祈愿类型失败');
        reject(e);
      });
  });
}

function isEnd(list: any) {
  if (list.length === 0) return true;
  return false;
}
function getGachaLogs(info: Info, name: string, code: number) {
  const data: any[] = [];
  let page = 1;
  let end_id = 0;
  return new Promise((resolve, reject) => {
    message.info(`准备获取「${name}」数据`);
    function log() {
      getGachaLog(info, code, page, end_id)
        .then((list: any) => {
          if (isEnd(list)) {
            resolve(data);
            message.info(`成功获取「${name}」数据`);
            return;
          }
          data.push(...list);
          message.info(`成功获取「${name}」第 ${page} 页`);
          page += 1;
          end_id = list.length > 0 ? list[list.length - 1].id : 0;
          setTimeout(log);
        })
        .catch((e) => {
          reject(e);
          message.error(`获取「${name}」第 ${page} 页失败`);
        });
    }
    log();
  });
}

function getGachaLog(info: Info, code: number, page: number, end_id: number) {
  return new Promise((resolve, reject) => {
    request(`${info.apiDomain}/event/gacha_info/api/getGachaLog`, {
      ...info.query,
      gacha_type: code,
      page,
      end_id,
      size: 20,
    })
      .then((res: any) => resolve(res.data.list))
      .catch(reject);
  });
}
