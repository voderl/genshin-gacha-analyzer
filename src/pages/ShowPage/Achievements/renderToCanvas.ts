/**
 * render achievements to canvas
 * 先定位再绘制，因此很多都返回{width:xxx, draw} 格式，调用draw时才绘制
 */
/** @jsxImportSource @emotion/react */
import { AchievementCardProps } from 'components/AchievementCard';
import { FONT_FAMILY, FONT_FAMILY_BOLD } from 'const';
import AchievedPng from 'resource/achievement_achieved.png';
import ShowPng from 'resource/achievement_show.png';
// @ts-ignore

const WIDTH = 750;

function getFont(size: number) {
  return `${size}px ${FONT_FAMILY_BOLD},${FONT_FAMILY}`;
}
// draw text auto change line
function drawText(
  ctx: CanvasRenderingContext2D,
  {
    text,
    width,
    letterSpace = 0,
    lineHeight,
    ...props
  }: {
    text: string;
    width?: number;
    letterSpace?: number;
    lineHeight?: number;
    font: CanvasRenderingContext2D['font'];
    fillStyle: CanvasRenderingContext2D['fillStyle'];
    textBaseline?: CanvasRenderingContext2D['textBaseline'];
    textAlign?: CanvasRenderingContext2D['textAlign'];
  },
) {
  const loc = {
    x: 0,
    y: 0,
  };
  const chars = text.split('');
  if (lineHeight === undefined) {
    const match = props.font.match(/\d\dpx/);
    if (match === null) throw new Error('match error');
    else lineHeight = parseFloat(match[0]) * 1.3;
  }
  const data: Array<{
    char: string;
    x: number;
    y: number;
  }> = [];
  const save: Array<{
    key: string;
    v: string;
  }> = [];
  function restore() {
    save.forEach(({ key, v }) => {
      (ctx as any)[key] = v;
    });
  }
  Object.keys(props).forEach((key) => {
    const v = (ctx as any)[key];
    if (v !== (props as any)[key]) {
      save.push({
        key,
        v,
      });
      (ctx as any)[key] = (props as any)[key];
    }
  });
  if (width === undefined) {
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const { width: charWidth } = ctx.measureText(char);
      data.push({
        char,
        x: loc.x,
        y: loc.y,
      });
      loc.x += charWidth + letterSpace;
    }
  } else {
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const { width: charWidth } = ctx.measureText(char);
      if (loc.x + charWidth + letterSpace > width) {
        loc.y += lineHeight;
        loc.x = 0;
        i--;
      } else {
        data.push({
          char,
          x: loc.x,
          y: loc.y,
        });
        loc.x += charWidth + letterSpace;
      }
    }
  }
  restore();
  return {
    draw(x: number, y: number) {
      Object.keys(props).forEach((key) => {
        (ctx as any)[key] = (props as any)[key];
      });
      data.forEach(({ char, x: sx, y: sy }) => {
        ctx.fillText(char, x + sx, y + sy);
      });
      restore();
    },
    width: width === undefined ? loc.x - letterSpace : width,
    height: loc.y + lineHeight,
  };
}
// loadImage to avoid async
const loadImage = (function () {
  const cache: {
    [key: string]: HTMLImageElement;
  } = Object.create(null);
  const loading: {
    [key: string]: Array<(image: HTMLImageElement) => void>;
  } = Object.create(null);
  function loadImage(src: string, cb: (image: HTMLImageElement) => void): void;
  function loadImage(src: string[], cb: (image: HTMLImageElement[]) => void): void;
  function loadImage(src: any, cb: any) {
    if (Array.isArray(src)) {
      let i = 0;
      const data: HTMLImageElement[] = [];
      src.forEach((str) => {
        loadImage(str, (image) => {
          data[i] = image;
          i++;
          if (i === src.length) cb(data);
        });
      });
      return;
    }
    if (src in cache) {
      cb(cache[src]);
    } else {
      if (src in loading) loading[src].push(cb);
      else {
        loading[src] = [cb];
        const image = new Image();
        image.src = src;
        image.onload = function (e) {
          const data = loading[src];
          delete loading[src];
          cache[src] = image;
          data.forEach((f) => f(image));
        };
        image.onerror = function (e) {
          delete loading[src];
        };
      }
    }
  }
  return loadImage;
})();
function drawImage(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  width: number,
  height: number,
  callback?: () => void,
) {
  const cb = function (image: HTMLImageElement) {
    ctx.drawImage(image, x, y, width, height);
    callback && callback();
  };
  loadImage(src, cb);
}

function drawOneAchievement(ctx: CanvasRenderingContext2D, achievement: AchievementCardProps) {
  const HEIGHT = 108;
  const BORDER_WIDTH = 2;
  const MARGIN_H = 4;
  const MARGIN_W = 8;
  const BORDER_MARGIN_W = BORDER_WIDTH + MARGIN_W;
  const BORDER_MARGIN_H = BORDER_WIDTH + MARGIN_H;
  const { width: LEFT_ZONE_WIDTH, draw: drawLeft } = drawLeftZone(ctx);
  const { width: RIGHT_ZONE_WIDTH, draw: drawRight } = drawRightZone(ctx, {
    value: achievement.value,
    achievedTime: achievement.achievedTime,
  });
  const contentWidth = WIDTH - 2 * BORDER_MARGIN_W - LEFT_ZONE_WIDTH - RIGHT_ZONE_WIDTH;
  const { height: fontHeight, draw: drawContent } = drawContentZone(ctx, {
    width: contentWidth,
    info: achievement.info,
    title: achievement.title,
  });
  const contentHeight = Math.max(fontHeight, HEIGHT - 2 * BORDER_WIDTH - 2 * MARGIN_H);
  return {
    height: contentHeight + 2 * BORDER_WIDTH + 2 * MARGIN_H,
    draw(x: number, y: number) {
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ebe2d8';
      ctx.fillRect(
        x + BORDER_MARGIN_W,
        y + BORDER_MARGIN_H,
        WIDTH - 2 * BORDER_MARGIN_W,
        contentHeight,
      );
      ctx.strokeStyle = '#e0d6cb';
      ctx.lineWidth = BORDER_WIDTH;
      ctx.lineJoin = 'round';
      const tmp_w = MARGIN_W + BORDER_WIDTH / 2;
      const tmp_h = MARGIN_H + BORDER_WIDTH / 2;
      ctx.strokeRect(x + tmp_w, y + tmp_h, WIDTH - 2 * tmp_w, contentHeight + BORDER_WIDTH);
      drawLeft(x + BORDER_MARGIN_W, y + BORDER_MARGIN_H, contentHeight);
      drawContent(x + BORDER_MARGIN_W + LEFT_ZONE_WIDTH, y + BORDER_MARGIN_H, contentHeight);
      drawRight(x + WIDTH - BORDER_MARGIN_W, y + BORDER_MARGIN_H, contentHeight);
    },
  };
}
// draw left logo
function drawLeftZone(ctx: CanvasRenderingContext2D) {
  const IMAGE_WIDTH = 104;
  const IMAGE_HEIGHT = 104;
  const SIZE = 80;
  const WIDTH = SIZE;
  const HEIGHT = SIZE;
  const LEFT_PADDING = 16;
  const RIGHT_PADDING = 16;
  return {
    width: LEFT_PADDING + WIDTH + RIGHT_PADDING,
    draw(left: number, top: number, contentHeight: number) {
      drawImage(
        ctx,
        AchievedPng,
        left + LEFT_PADDING,
        top + contentHeight / 2 - HEIGHT / 2,
        WIDTH,
        HEIGHT,
      );
    },
  };
}
// draw text
function drawContentZone(
  ctx: CanvasRenderingContext2D,
  {
    width,
    title,
    info,
  }: {
    width: number;
    title: string;
    info: string;
  },
) {
  const PADDING_TOP = 12;
  const PADDING_BOTTOM = 12;
  const SPACE = 8;
  const { height: titleHeight, draw: drawTitle } = drawText(ctx, {
    text: title,
    width,
    fillStyle: '#585757',
    font: getFont(20),
  });
  const { height: infoHeight, draw: drawInfo } = drawText(ctx, {
    text: info,
    width,
    fillStyle: '#988b81',
    font: getFont(16),
  });
  const height = titleHeight + SPACE + infoHeight;
  return {
    height: PADDING_TOP + height + PADDING_BOTTOM,
    draw(left: number, top: number, contentHeight: number) {
      let x = left,
        y = top + contentHeight / 2 - height / 2;
      drawTitle(x, y);
      y += titleHeight + SPACE;
      drawInfo(x, y);
    },
  };
}
// draw right zone
function drawRightZone(
  ctx: CanvasRenderingContext2D,
  {
    achievedTime,
    value,
  }: {
    value?: string | number;
    achievedTime?: string;
  },
) {
  const IMAGE_WIDTH = 147;
  const IMAGE_HEIGHT = 115;
  const HEIGHT = 96;
  const WIDTH = 140;
  const realImageWidth = (HEIGHT / IMAGE_HEIGHT) * IMAGE_WIDTH;
  return {
    width: WIDTH,
    draw(right: number, top: number, contentHeight: number) {
      function drawValue() {
        if (value !== undefined) {
          const { width, draw } = drawText(ctx, {
            text: value.toString(),
            font: getFont(20),
            fillStyle: '#988b81',
            textBaseline: 'middle',
          });
          draw(right - realImageWidth / 2 - width / 2, top + contentHeight / 2);
        }
      }
      if (achievedTime) {
        drawImage(
          ctx,
          ShowPng,
          right - realImageWidth,
          top + contentHeight / 2 - HEIGHT / 2,
          realImageWidth,
          HEIGHT,
          () => {
            drawValue();
            const { width, draw } = drawText(ctx, {
              text: achievedTime,
              font: getFont(15),
              fillStyle: '#988b81',
              textBaseline: 'middle',
            });
            draw(right - realImageWidth / 2 - width / 2, top + contentHeight / 2 + 34);
          },
        );
      } else drawValue();
    },
  };
}

function drawEndLine(ctx: CanvasRenderingContext2D) {
  const LINE_PADDING = 20;
  const {
    width: fontWidth,
    height,
    draw,
  } = drawText(ctx, {
    text: 'https://genshin.voderl.cn/',
    font: `13px ${FONT_FAMILY}`,
    fillStyle: '#988b81',
    letterSpace: 1,
    textBaseline: 'middle',
  });
  const HEIGHT = 20;
  return {
    height: HEIGHT,
    draw(top: number) {
      ctx.fillStyle = '#585757';
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      const centerY = top + HEIGHT / 2;
      ctx.beginPath();
      ctx.moveTo(LINE_PADDING, centerY);
      ctx.lineTo(WIDTH / 2 - fontWidth / 2 - LINE_PADDING, centerY);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2 + fontWidth / 2 + LINE_PADDING, centerY);
      ctx.lineTo(WIDTH - LINE_PADDING, centerY);
      ctx.closePath();
      ctx.stroke();
      draw(WIDTH / 2 - fontWidth / 2, centerY);
    },
  };
}
export function renderToCanvas(
  achievements: AchievementCardProps[],
  cb: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement('canvas');
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d', {
    alpha: false,
  }) as any;
  loadImage([AchievedPng, ShowPng], (data) => {
    const TOP_BOTTOM_PADDING = 2;
    let x = 0,
      y = TOP_BOTTOM_PADDING;
    const draws = []; // store draw method
    for (let i = 0; i < achievements.length; i++) {
      const item = achievements[i];
      const { height, draw } = drawOneAchievement(ctx, item);
      draws.push(
        (function (sx, sy) {
          return () => void draw(sx, sy);
        })(x, y),
      );
      y += height;
    }
    const { height: endLineHeight, draw: drawEnd } = drawEndLine(ctx);
    canvas.width = WIDTH;
    canvas.height = y + TOP_BOTTOM_PADDING + endLineHeight;
    ctx.fillStyle = '#f0eae2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draws.forEach((f) => f());
    drawEnd(y);
    cb(canvas, ctx);
  });
}
