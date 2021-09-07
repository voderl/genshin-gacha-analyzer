import { POOL_TYPE_TO_NAME } from 'const';
import { ExcelParsedObject } from 'utils/parseExcel';
// @ts-ignore
import * as download from 'downloadjs';

// 预加载
import('exceljs');
// from https://github.com/sunfkny/genshin-gacha-export-js
function pad(num: number) {
  return `${num}`.padStart(2, '0');
}
function getTimeString() {
  const d = new Date();
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${YYYY}${MM}${DD}_${HH}${mm}${ss}`;
}

export default function downloadExcel(data: ExcelParsedObject): Promise<any> {
  return new Promise((resolve, reject) => {
    import('exceljs').then((module) => {
      const ExcelJS = module;
      const workbook = new ExcelJS.Workbook();
      const types = Object.keys(POOL_TYPE_TO_NAME);
      types.forEach((type) => {
        const sheet = workbook.addWorksheet(POOL_TYPE_TO_NAME[type], {
          views: [{ state: 'frozen', ySplit: 1 }],
        });
        sheet.columns = [
          { header: '时间', key: 'time', width: 24 },
          { header: '名称', key: 'name', width: 14 },
          { header: '类别', key: 'type', width: 8 },
          { header: '星级', key: 'rank', width: 8 },
          { header: '总次数', key: 'idx', width: 8 },
          { header: '保底内', key: 'pdx', width: 8 },
        ];
        const logs = data[type as keyof ExcelParsedObject].map((item, index) => {
          // const match = data.find((v) => v.item_id === item.item_id);
          return [item.时间, item.名称, item.类别, item.星级, item.总次数, item.保底内];
        });
        sheet.addRows(logs);
        // set xlsx hearer style
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach((v) => {
          sheet.getCell(`${v}1`).border = {
            top: { style: 'thin', color: { argb: 'ffc4c2bf' } },
            left: { style: 'thin', color: { argb: 'ffc4c2bf' } },
            bottom: { style: 'thin', color: { argb: 'ffc4c2bf' } },
            right: { style: 'thin', color: { argb: 'ffc4c2bf' } },
          };
          sheet.getCell(`${v}1`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ffdbd7d3' },
          };
          sheet.getCell(`${v}1`).font = {
            name: '微软雅黑',
            color: { argb: 'ff757575' },
            bold: true,
          };
        });
        // set xlsx cell style
        logs.forEach((v, i) => {
          ['A', 'B', 'C', 'D', 'E', 'F'].forEach((c) => {
            sheet.getCell(`${c}${i + 2}`).border = {
              top: { style: 'thin', color: { argb: 'ffc4c2bf' } },
              left: { style: 'thin', color: { argb: 'ffc4c2bf' } },
              bottom: { style: 'thin', color: { argb: 'ffc4c2bf' } },
              right: { style: 'thin', color: { argb: 'ffc4c2bf' } },
            };
            sheet.getCell(`${c}${i + 2}`).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'ffebebeb' },
            };
            // rare rank background color
            const rankColor = {
              3: 'ff8e8e8e',
              4: 'ffa256e1',
              5: 'ffbd6932',
            } as any;
            sheet.getCell(`${c}${i + 2}`).font = {
              name: '微软雅黑',
              color: { argb: rankColor[v[3]] },
              bold: v[3] !== '3',
            };
          });
        });
      });
      workbook.xlsx.writeBuffer().then((buffer: any) => {
        download(
          new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          `原神抽卡记录_${getTimeString()}.xlsx`,
        );
        resolve(workbook);
      });
    });
  });
}

export const a = 1;
