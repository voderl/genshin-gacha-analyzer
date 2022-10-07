// import { Tween, update, Easing } from "@tweenjs/tween.js";
// tween-animte is an unstable library now, please don't use it in production. you can replace it with another tween library.
import Animate, { AnimateOptions, AnimateInstanceType } from 'tween-animate';
import { limitRectInContainer, TRect } from './utils';

const { Easing } = Animate;

function createAnimationFrame() {
  const requestAnimationFrame = window.requestAnimationFrame;
  let playing = false;
  let destroyed = false;
  const tickerList: Array<() => void> = [];
  function ticker() {
    if (playing) {
      if (tickerList.length !== 0) {
        for (let i = 0, len = tickerList.length; i < len; i++) {
          tickerList[i]();
        }
      }
    }
    if (!destroyed) requestAnimationFrame(ticker);
  }
  // keep frame to ensure soomth animation.
  requestAnimationFrame(ticker);
  return {
    play() {
      playing = true;
    },
    stop() {
      playing = false;
    },
    addTicker(ticker: () => void) {
      tickerList.push(ticker);
    },
    removeTicker(ticker: () => void) {
      const idx = tickerList.indexOf(ticker);
      if (idx !== -1) tickerList.splice(idx, 1);
    },
    destroy() {
      destroyed = true;
      tickerList.splice(0, tickerList.length);
    },
  };
}

type TRenderItem = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  base: Omit<TRenderItem, 'base'>;
};

function getBoundInfo(bound: TRenderItem) {
  const { base } = bound;
  return {
    centerX: base.x + base.width / 2,
    centerY: base.y + base.width / 2,
    width: base.width / base.scale,
    height: base.height / base.scale,
  };
}

function getScaleTween(
  bound: TRenderItem,
  from: number,
  to: number,
  options: Partial<AnimateOptions>,
) {
  const { base } = bound;
  const centerX = base.x + base.width / 2;
  const centerY = base.y + base.width / 2;
  const width = base.width / base.scale;
  const height = base.height / base.scale;
  function updateBound(scale: number) {
    bound.width = scale * width;
    bound.height = scale * height;
    bound.x = centerX - bound.width / 2;
    bound.y = centerY - bound.height / 2;
    bound.scale = scale;
  }
  return Animate(from, to, options)
    .on('start', () => updateBound(from))
    .on('update', (scale) => {
      updateBound(scale);
    });
  // return new Tween({ x: from })
  //   .to({ x: to }, time)
  //   .onStart(() => updateBound(from))
  //   .onUpdate(({ x: scale }) => {
  //     updateBound(scale);
  //   });
}

/**
 * tween animate system.
 * will ticker at every frame only when a tween is playing.
 */
export function createTweenAnimates() {
  const tweens: Array<{
    value: any;
    tween: any;
    level: number;
  }> = [];
  const tweenList: any[] = [];

  const animationFrame = createAnimationFrame();

  animationFrame.addTicker(() => {
    Animate.update(tweenList);
  });

  function addTween(bound: TRenderItem, tween: AnimateInstanceType, level: number) {
    const item = tweens.find((tweenItem) => tweenItem.value === bound);
    if (item) {
      if (level < item.level) {
        tween.stop();
        return tween;
      }
      item.tween.destroy();
      item.value = bound;
      item.level = level;
      item.tween = tween.on('complete', () => {
        const idx = tweens.findIndex((tweenItem) => tweenItem.value === bound);
        if (idx !== -1) tweens.splice(idx, 1);
        if (tweens.length === 0) animationFrame.stop();
      });
      return tween;
    }
    tweens.push({
      value: bound,
      level: level,
      tween: tween.on('complete', () => {
        const idx = tweens.findIndex((tweenItem) => tweenItem.value === bound);
        if (idx !== -1) tweens.splice(idx, 1);
        if (tweens.length === 0) animationFrame.stop();
      }),
    });
    if (tweens.length !== 0) animationFrame.play();
    return tween;
  }

  const animates = {
    hoverEnter(bound: TRenderItem, scale: number, container: TRect) {
      return addTween(
        bound,
        getScaleTween(bound, bound.scale, scale, {
          time: 300,
          easing: Easing.Quadratic.Out,
          list: tweenList,
        }).on('update', () => {
          Object.assign(bound, limitRectInContainer(bound, container));
        }),
        1,
      );
    },
    hoverLeave(bound: TRenderItem, container: TRect) {
      return addTween(
        bound,
        getScaleTween(bound, bound.scale, bound.base.scale, {
          time: 100,
          easing: Easing.Quadratic.In,
          list: tweenList,
        }).on('update', () => {
          Object.assign(bound, limitRectInContainer(bound, container));
        }),
        1,
      );
    },
    show(bound: TRenderItem) {
      return addTween(
        bound,
        getScaleTween(bound, 0, bound.base.scale, {
          time: 300,
          easing: Easing.Quartic.Out,
          list: tweenList,
        }),
        10,
      );
    },
    hide(bound: TRenderItem) {
      return addTween(
        bound,
        getScaleTween(bound, bound.base.scale, 0, {
          time: 150,
          easing: Easing.Quadratic.In,
          list: tweenList,
        }),
        10,
      );
    },
    update(bound1: TRenderItem, bound2: TRenderItem) {
      const info1 = getBoundInfo(bound1);
      const info2 = getBoundInfo(bound2);
      function updateBound(bound: TRenderItem, x: number, y: number, scale: number) {
        bound.width = scale * info2.width;
        bound.height = scale * info2.height;
        bound.x = x - bound.width / 2;
        bound.y = y - bound.height / 2;
        bound.scale = scale;
      }

      return addTween(
        bound2,
        Animate(
          {
            x: info1.centerX,
            y: info1.centerY,
            scale: bound1.scale,
          },
          { x: info2.centerX, y: info2.centerY, scale: bound2.base.scale },
          {
            time: 300,
            easing: Easing.Quadratic.Out,
            list: tweenList,
          },
        )
          .on('start', () => updateBound(bound2, info1.centerX, info1.centerY, bound1.scale))
          .on('update', ({ x, y, scale }) => {
            updateBound(bound2, x, y, scale);
          }),
        10,
      );
    },
  };
  return {
    animationFrame,
    animates,
    destroy() {
      animationFrame.destroy();
      tweens.splice(0, tweens.length);
    },
  };
}
