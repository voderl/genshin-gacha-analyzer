/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { DataItem } from 'types';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart as EchartsPieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { COLOR, FONT_FAMILY } from 'const';
import { getColorByPercent, percent, timeFormatter } from './utils';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, EchartsPieChart, CanvasRenderer]);

function getFont(size: number) {
  return `${size}px ${FONT_FAMILY}`;
}

// 对canvas执行操作的函数
type CanvasFunc = (ctx: CanvasRenderingContext2D) => void;
// 对canvas执行setup，如果setup返回一个函数，则返回的函数是restore
type CanvasSetup = (ctx: CanvasRenderingContext2D) => CanvasFunc | void;
type TextItem =
  | string
  | {
      text: string;
      setup?: CanvasSetup;
    };
const isChangeLineChar = (char: string) => char === '\n';
// draw text auto change line
function drawText(
  ctx: CanvasRenderingContext2D,
  {
    text,
    width,
    letterSpace = 0,
    lineHeight,
    setup,
  }: {
    text: TextItem | TextItem[];
    width?: number;
    letterSpace?: number;
    lineHeight?: number;
    setup?: CanvasSetup;
  },
) {
  const loc = {
    x: 0,
    y: 0,
  };
  let restore: any;
  const data: Array<
    | {
        char: string;
        x: number;
        y: number;
      }
    | CanvasFunc
  > = []; // 记录绘制操作，是function则是对canvas的处理，是对象则是绘制字体的坐标
  if (setup) {
    restore = setup(ctx);
    data.push(setup);
  }
  if (lineHeight === undefined) {
    // 获取lineHeight
    const match = ctx.font.match(/\d\dpx/);
    if (match === null) throw new Error('match error');
    else lineHeight = parseFloat(match[0]) * 1.3;
  }
  const fromattedText = Array.isArray(text) ? text : [text];
  let maxWidth = 0;
  function changeLine() {
    loc.y += lineHeight!;
    maxWidth = Math.max(loc.x, maxWidth);
    loc.x = 0;
  }
  // 遍历字符char
  const walk =
    width === undefined
      ? function (char: string) {
          if (isChangeLineChar(char)) return changeLine();
          const { width: charWidth } = ctx.measureText(char);
          data.push({
            char,
            x: loc.x,
            y: loc.y,
          });
          loc.x += charWidth + letterSpace;
        }
      : function (char: string) {
          if (isChangeLineChar(char)) return changeLine();
          const { width: charWidth } = ctx.measureText(char);
          if (loc.x + charWidth + letterSpace > width) {
            changeLine();
            walk(char);
          } else {
            data.push({
              char,
              x: loc.x,
              y: loc.y,
            });
            loc.x += charWidth + letterSpace;
          }
        };
  fromattedText.forEach((textItem) => {
    let str, restore;
    if (typeof textItem === 'string') str = textItem;
    else {
      str = textItem.text;
      if (textItem.setup) {
        restore = textItem.setup(ctx);
        data.push(textItem.setup);
      }
    }
    for (let i = 0; i < str.length; i++) {
      walk(str[i]);
    }
    if (restore) {
      restore(ctx);
      data.push(restore);
    }
  });
  if (restore) {
    restore(ctx);
    data.push(restore);
  }
  return {
    draw(x: number, y: number) {
      // 实际进行绘制
      data.forEach((item) => {
        if (typeof item === 'function') item(ctx);
        else {
          const { char, x: sx, y: sy } = item;
          ctx.fillText(char, x + sx, y + sy);
        }
      });
    },
    width: maxWidth === 0 ? loc.x : maxWidth,
    height: loc.y + lineHeight,
  };
}
// 返回不同颜色字体的设置
function colorText(text: string | number, color: string) {
  return {
    text: ' ' + text + ' ',
    setup(ctx: CanvasRenderingContext2D) {
      const before = ctx.fillStyle;
      ctx.fillStyle = color;
      return () => {
        ctx.fillStyle = before;
      };
    },
  };
}
// draw Text by tag function
function drawTextByTag(
  ctx: CanvasRenderingContext2D,
  {
    width,
    letterSpace = 0,
    lineHeight,
    setup,
  }: {
    width?: number;
    letterSpace?: number;
    lineHeight?: number;
    setup?: CanvasSetup;
  },
) {
  return function (rawStringArr: any, ...list: (TextItem | TextItem[])[]) {
    const text = [];
    for (let i = 0; i < rawStringArr.length; i++) {
      text.push(rawStringArr[i]);
      if (i < list.length) {
        const item = list[i];
        if (Array.isArray(item)) text.push(...item);
        else text.push(item);
      }
    }
    return drawText(ctx, {
      text,
      width,
      letterSpace,
      lineHeight,
      setup,
    });
  };
}
// 传入参数
type Info = {
  name: string;
  chartSelected: {
    [x: string]: boolean;
  };
  poolMax: number;
  chartData: {
    value: number;
    name: string;
  }[];
  chartColors: string[];
  fromTime: number;
  toTime: number;
  totalCount: number;
  leftCount: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  fiveStarHistory: DataItem[];
  fiveStarAverage: number;
};
const WIDTH = 450;
const HEIGHT = 325;
const renderTextContent = (
  ctx: CanvasRenderingContext2D,
  {
    totalCount,
    poolMax,
    fiveStarCount,
    fourStarCount,
    threeStarCount,
    fiveStarHistory,
    fiveStarAverage,
    fromTime,
    toTime,
    leftCount,
  }: Info,
) => {
  const TEXT_PADDING = 15;
  const LINE_SPACE = 4;
  const CONTENT_WIDTH = WIDTH - 2 * TEXT_PADDING;
  const baseTextSet = drawTextByTag(ctx, {
    width: CONTENT_WIDTH,
  });
  const resetCanvas = () => {
    ctx.font = getFont(16);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
  };
  const getColorByCount = (count: number) => {
    return getColorByPercent(count / poolMax);
  };
  const colorCount = (count: number) => colorText(count, getColorByCount(count));
  resetCanvas();
  let height = 0;
  const {
    width: dateWidth,
    height: dateHeight,
    draw: drawDate,
  } = baseTextSet`${colorText(`${timeFormatter(fromTime)} - ${timeFormatter(toTime)}`, '#808080')}`;
  height += dateHeight + LINE_SPACE;
  const {
    width: infoWidth,
    height: infoHeight,
    draw: drawInfo,
  } = baseTextSet`一共${colorText(totalCount, '#1890ff')}抽，已累计${colorCount(
    leftCount,
  )}抽未出5星`;
  height += infoHeight + LINE_SPACE;
  const {
    width: starWidth,
    height: starHeight,
    draw: drawStarCount,
  } = baseTextSet`${colorText(`5星：${fiveStarCount}`, COLOR.FIVE_STAR)}\n${colorText(
    `4星：${fourStarCount}`,
    COLOR.FOUR_STAR,
  )}\n${colorText(`3星：${threeStarCount}`, COLOR.THREE_STAR)}`;
  height += starHeight + LINE_SPACE;
  const { draw: drawPercent } = baseTextSet`${colorText(
    `[${percent(fiveStarCount, totalCount)}]`,
    COLOR.FIVE_STAR,
  )}\n${colorText(`[${percent(fourStarCount, totalCount)}]`, COLOR.FOUR_STAR)}\n${colorText(
    `[${percent(threeStarCount, totalCount)}]`,
    COLOR.THREE_STAR,
  )}`;
  let drawExtraInfo: any;
  if (fiveStarHistory.length !== 0) {
    const { height: fiveStarHistoryHeight, draw: drawHistory } = baseTextSet(
      ['5星历史记录：'],
      fiveStarHistory.map((item) =>
        colorText(`${item.名称}[${item.保底内}]`, getColorByCount(item.保底内)),
      ),
    );
    height += fiveStarHistoryHeight + LINE_SPACE;
    const { height: averageHeight, draw: drawAverage } = baseTextSet`5星平均出货次数：${colorCount(
      parseFloat(fiveStarAverage.toFixed(2)),
    )}`;
    height += averageHeight + LINE_SPACE;
    drawExtraInfo = function (x: number, y: number) {
      drawHistory(x, y);
      drawAverage(x, y + fiveStarHistoryHeight + LINE_SPACE);
    };
  }
  return {
    width: CONTENT_WIDTH,
    height,
    draw(x: number, y: number) {
      const loc = {
        x: x + TEXT_PADDING,
        y,
      };
      resetCanvas();
      drawDate(loc.x + CONTENT_WIDTH / 2 - dateWidth / 2, loc.y);
      loc.y += dateHeight + LINE_SPACE;
      drawInfo(loc.x, loc.y);
      loc.y += infoHeight + LINE_SPACE;
      drawStarCount(loc.x, loc.y);
      drawPercent(loc.x + starWidth + 50, loc.y);
      loc.y += starHeight + LINE_SPACE;
      drawExtraInfo && drawExtraInfo(loc.x, loc.y);
    },
  };
};
// 绘制尾部链接
function drawEndLine(ctx: CanvasRenderingContext2D) {
  const LINE_PADDING = 20;
  const {
    width: fontWidth,
    height,
    draw: drawLink,
  } = drawText(ctx, {
    text: 'https://genshin.voderl.cn/',
    letterSpace: 1,
    setup(ctx) {
      ctx.font = getFont(13);
      ctx.fillStyle = '#988b81';
      ctx.textBaseline = 'middle';
    },
  });
  const HEIGHT = 20;
  return {
    height: HEIGHT,
    draw(x: number, y: number, width: number) {
      ctx.strokeStyle = '#e0d6cb';
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      const centerY = y + HEIGHT / 2;
      ctx.beginPath();
      ctx.moveTo(x + LINE_PADDING, centerY);
      ctx.lineTo(x + width / 2 - fontWidth / 2 - LINE_PADDING, centerY);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + width / 2 + fontWidth / 2 + LINE_PADDING, centerY);
      ctx.lineTo(x + width - LINE_PADDING, centerY);
      ctx.closePath();
      ctx.stroke();
      drawLink(x + width / 2 - fontWidth / 2, centerY);
    },
  };
}

export function renderToCanvas(
  infoList: Info[],
  isVertical = false,
  callback: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void,
) {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
  const tempCanvas = document.createElement('canvas'); // 用于绘制echarts
  tempCanvas.width = WIDTH;
  tempCanvas.height = HEIGHT;
  const textStyle = {
    fontFamily: FONT_FAMILY,
    fontStyle: 'normal',
  };
  const chart = echarts.init(tempCanvas, {
    renderer: 'canvas',
    width: WIDTH,
    height: 300,
  });
  chart.setOption({
    textStyle: {
      fontFamily: FONT_FAMILY,
      fontStyle: 'normal',
    },
    title: {
      left: 'center',
      textStyle,
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      top: '10%',
      left: 'center',
    },
    animation: false,
  });
  const PADDING = {
    TOP: 10,
    LEFT: 10,
    RIGHT: 10,
    BOTTOM: 0,
  };
  const loc = {
    x: PADDING.LEFT,
    y: PADDING.TOP,
  };
  const draws: (() => any)[] = []; // 存储实际进行绘制的函数
  let maxHeight = 0;
  // echarts绘制到tempCanvas上，再绘制到cacheCanvas上(cacheCanvas尺寸可以绘制多个饼图作为缓存)
  const cacheCanvas = document.createElement('canvas');
  cacheCanvas.width = WIDTH * infoList.length;
  cacheCanvas.height = HEIGHT;
  const cacheCtx = cacheCanvas.getContext('2d')!;

  infoList.forEach((info, index) => {
    // 根据每个info来绘制
    chart.setOption({
      title: {
        text: info.name,
      },
      legend: {
        selected: info.chartSelected,
      },
      color: info.chartColors,
      series: [
        {
          name: info.name,
          type: 'pie',
          top: 50,
          startAngle: 70,
          radius: '70%',
          data: info.chartData,
        },
      ],
    });
    // 将echarts绘制到tempCanvas，再绘制到cacheCanvas
    cacheCtx.drawImage(tempCanvas, 0, 0, WIDTH, HEIGHT, index * WIDTH, 0, WIDTH, HEIGHT);
    const { height: contentHeight, draw: drawContent } = renderTextContent(ctx, info);
    if (isVertical) {
      maxHeight += contentHeight + HEIGHT + 10;
    } else {
      maxHeight = Math.max(maxHeight, contentHeight + HEIGHT);
    }
    (function (x: number, y: number, i: number) {
      draws.push(() =>
        ctx.drawImage(cacheCanvas, i * WIDTH, 0, WIDTH, HEIGHT, x, y, WIDTH, HEIGHT),
      );
      draws.push(() => drawContent(x, y + HEIGHT));
    })(loc.x, loc.y, index);
    if (isVertical) {
      loc.y = maxHeight;
    } else loc.x += WIDTH;
  });
  const { height: endLineHeight, draw: drawEndLink } = drawEndLine(ctx);
  const canvasWidth = loc.x + PADDING.RIGHT + (isVertical ? WIDTH : 0);
  const canvasHeight = maxHeight + endLineHeight + PADDING.TOP + PADDING.BOTTOM;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx.fillStyle = '#fff'; // #f9f9f9
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  draws.forEach((draw) => draw());
  const endLineWidth = WIDTH;
  drawEndLink((canvasWidth - endLineWidth) / 2, canvasHeight - endLineHeight, endLineWidth);
  callback(canvas, ctx);

  // destroy
  chart.dispose();
  [tempCanvas, canvas, cacheCanvas].forEach((canvas) => {
    canvas.width = 0;
    canvas.height = 0;
  });
}
