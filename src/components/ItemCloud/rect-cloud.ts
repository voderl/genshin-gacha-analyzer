// Reference: https://github.com/jasondavies/d3-cloud/blob/master/index.js

import { keyBy as utilsKeyBy } from "lodash";
import { createTweenAnimates } from "./animate";
import { isIntersect, isInRect, TRect, moveToLast } from "./utils";

function archimedeanSpiral(ratio: number) {
  const b = 0.1;
  return function (t: number): [number, number] {
    return [ratio * (t *= b) * Math.cos(t), t * Math.sin(t)];
  };
}

export type TRectItem = {
  width: number;
  height: number;
  draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number): void;
  scale: number;
  [key: string]: any;
};

type TOptions<T = TRectItem> = {
  canvas: HTMLCanvasElement;
  dataSource: Array<T>;
  /**
   * key must be unique. Hide or move rect will depend on key.
   */
  keyBy?: (item: T, index: number) => string | number;
  background?: CanvasRenderingContext2D["fillStyle"];
  onHover?: (item: T | null, event: MouseEvent) => void;
  /**
   * render content will scale to fit the canvas, this is the maxScale.
   */
  maxScale?: number;
};

type TBound<T = TRectItem> = TRect & {
  draw: (scale: number, offsetX: number, offsetY: number) => void;
  item: T;
  scale: number;
};

type TRenderBound<T = TRectItem> = TRect & {
  scale: number;
  draw: (scale: number, offsetX: number, offsetY: number) => void;
  base: TBound<T>;
  key: string | number;
};

type TLayoutOptions<T = TRectItem> = {
  ctx: CanvasRenderingContext2D;
  spiral: (t: number) => [number, number];
  bounds: Array<TBound<T>>;
};

export type TRectCloudInstance<T> = {
  render: () => void;
  updateData: (dataSource: T[]) => void;
  destroy: () => void;
};

/**
 * calculate the rect location in archimedeanSpiral Coordinate.
 */
function layoutRectItem(item: TRectItem, options: TLayoutOptions) {
  const { spiral, bounds, ctx } = options;
  let t = 0;
  const dt = Math.random() < 0.5 ? 1 : -1;
  // const dt = 1;
  const { width, height, draw, scale } = item;
  const startTime = performance.now();
  while (performance.now() - startTime <= 30) {
    const dxdy = spiral(t);
    const dx = ~~dxdy[0];
    const dy = ~~dxdy[1];
    const rect = {
      x: dx - (width * scale) / 2,
      y: dy - (height * scale) / 2,
      width: width * scale,
      height: height * scale,
    };
    if (bounds.every((bound) => !isIntersect(bound, rect))) {
      bounds.push({
        ...rect,
        draw(totalScale: number, offsetX: number, offsetY: number) {
          ctx.translate(offsetX, offsetY);
          ctx.scale(totalScale, totalScale);
          draw(ctx, offsetX * totalScale, offsetY * totalScale);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        },
        item,
        scale,
      });
      return;
    }

    t += dt;
  }
}

const uniqueKeyBy = (function () {
  let count = 0;
  return function keyBy(item: any) {
    return count++;
  };
})();

export function createRectCloud<T extends TRectItem>(
  options: TOptions<T>
): TRectCloudInstance<T> {
  const {
    canvas,
    dataSource,
    keyBy = uniqueKeyBy,
    maxScale: maxGlobalScale = 1,
  } = options;
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d")!;

  const {
    animationFrame,
    animates,
    destroy: tweenAnimatesDestroy,
  } = createTweenAnimates();

  const boundContainer = {
    x: 0,
    y: 0,
    width,
    height,
  };

  // data for render
  let renderContext: {
    renderBounds: TRenderBound<T>[];
    globalScale: number;
    dataSource: T[];
  } = {
    renderBounds: [],
    globalScale: 1,
    dataSource: [],
  };

  function getRenderContext(dataSource: T[]) {
    const bounds: TBound<T>[] = [];
    for (let i = 0, len = dataSource.length; i < len; i++) {
      layoutRectItem(dataSource[i], {
        spiral: archimedeanSpiral(width / height),
        ctx,
        bounds,
      });
    }

    let minX = 0,
      maxX = 0,
      minY = 0,
      maxY = 0;

    for (let i = 0, len = bounds.length; i < len; i++) {
      const bound = bounds[i];
      minX = Math.min(minX, bound.x);
      maxX = Math.max(maxX, bound.x + bound.width);
      minY = Math.min(minY, bound.y);
      maxY = Math.max(maxY, bound.y + bound.height);
    }

    const globalScale = Math.min(
      maxGlobalScale,
      1 / Math.max((maxX - minX) / width, (maxY - minY) / height)
    );

    const offsetX = width / 2 - ((maxX + minX) / 2) * globalScale;
    const offsetY = height / 2 - ((maxY + minY) / 2) * globalScale;

    const renderBounds: TRenderBound<T>[] = bounds.map((bound, index) => {
      // get coord in canvas Coordinate from archimedeanSpiral Coordinate
      const newBound = {
        ...bound,
        x: bound.x * globalScale + offsetX,
        y: bound.y * globalScale + offsetY,
        width: globalScale * bound.width,
        height: globalScale * bound.height,
        scale: globalScale * bound.scale,
      };
      return {
        ...newBound,
        key: keyBy(bound.item, index),
        base: newBound,
      };
    });

    return {
      globalScale,
      renderBounds,
      dataSource,
    };
  }

  // when dataSource change
  function updateData(newDataSource: T[]) {
    const { renderBounds: oldRenderBounds, dataSource: oldDataSource } =
      renderContext;
    if (newDataSource === oldDataSource) return;

    if (dataSource.length === 0) {
      renderContext.renderBounds = [];
    } else {
      renderContext = getRenderContext(newDataSource);
    }

    const { renderBounds: newRenderBounds } = renderContext;

    const oldRenderBoundsKeyMap = utilsKeyBy(oldRenderBounds, "key");
    const newRenderBoundsKeyMap = utilsKeyBy(newRenderBounds, "key");

    newRenderBounds.forEach((renderBound) => {
      if (!(renderBound.key in oldRenderBoundsKeyMap)) {
        animates.show(renderBound);
      }
    });
    oldRenderBounds.forEach((renderBound) => {
      const { key } = renderBound;
      if (key in newRenderBoundsKeyMap) {
        animates.update(renderBound, newRenderBoundsKeyMap[key]);
      } else {
        newRenderBounds.unshift(renderBound);
        animates.hide(renderBound).on("complete", () => {
          const idx = newRenderBounds.indexOf(renderBound);
          if (idx !== -1) newRenderBounds.splice(idx, 1);
        });
      }
    });
  }

  const hoverBoundRef: {
    current: null | TRenderBound<T>;
  } = {
    current: null,
  };

  function hoverListener(evt: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = evt;
    const coord = {
      x: (clientX - rect.left) * (width / rect.width),
      y: (clientY - rect.top) * (height / rect.height),
    };
    const { renderBounds, globalScale } = renderContext;

    // if a bound is hovering and mouse not moveout the bound
    if (hoverBoundRef.current) {
      if (isInRect(hoverBoundRef.current, coord)) {
        const bound = hoverBoundRef.current;
        options.onHover && options.onHover(bound ? bound.base.item : null, evt);
        return;
      }
    }

    const bound = renderBounds.find((renderBound) =>
      isInRect(renderBound.base, coord)
    );

    // when hovering bound change
    if (!bound && hoverBoundRef.current) {
      animates.hoverLeave(hoverBoundRef.current, boundContainer);
    } else if (bound && !hoverBoundRef.current) {
      animates.hoverEnter(bound, globalScale * 1.1, boundContainer);
      moveToLast(bound, renderBounds);
    } else if (
      bound &&
      hoverBoundRef.current &&
      bound !== hoverBoundRef.current
    ) {
      animates.hoverEnter(bound, globalScale * 1.1, boundContainer);
      moveToLast(bound, renderBounds);
      animates.hoverLeave(hoverBoundRef.current, boundContainer);
    }

    hoverBoundRef.current = bound ? bound : null;

    options.onHover && options.onHover(bound ? bound.base.item : null, evt);
  }

  const mouseOutListener = () => {
    if (hoverBoundRef.current) {
      animates.hoverLeave(hoverBoundRef.current, boundContainer);
      hoverBoundRef.current = null;
    }
  };

  canvas.addEventListener("mousemove", hoverListener);
  canvas.addEventListener("mouseout", mouseOutListener);

  function render() {
    ctx.clearRect(0, 0, width, height);
    if (options.background) {
      ctx.fillStyle = options.background;
      ctx.fillRect(0, 0, width, height);
    }
    const { renderBounds } = renderContext;
    for (let i = 0, len = renderBounds.length; i < len; i++) {
      const bound = renderBounds[i];

      const { x, y, draw, scale } = bound;
      draw(scale, x, y);
    }
  }

  animationFrame.addTicker(render);

  if (dataSource) updateData(dataSource);

  return {
    destroy() {
      tweenAnimatesDestroy();
      canvas.removeEventListener("mousemove", hoverListener);
      canvas.removeEventListener("mouseout", mouseOutListener);
    },
    updateData,
    render,
  };
}
