/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useEffect, useMemo, useRef } from 'react';
import { FONT_FAMILY, ISMOBILE } from 'const';
import { TParsedItem } from 'types';
import { createRectCloud, TRectCloudInstance, TRectItem } from './rect-cloud';
import { loader } from './loader';
import { throttle } from 'lodash';
import { fillImageRoundRect, fillRoundRect, getItemNameByKey } from 'utils';

type TItem = Pick<TParsedItem, 'key' | 'rarity'> & {
  count: number;
};

export interface IItemCloudProps {
  dataSource: Array<TItem>;
  width?: number;
  height?: number;
  [key: string]: any;
}

const tooltipCss = css`
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.4;
  transition: z-index 0.2s, opacity 0.2s;
  position: absolute;
  pointer-events: none;
  white-space: nowrap;
  z-index: 999;

  opacity: 0;
`;

export const ItemCloud: FC<IItemCloudProps> = ({ width = 800, height = 600, dataSource }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rectCloudRef = useRef<TRectCloudInstance<
    TRectItem & {
      data: TItem;
    }
  > | null>(null);

  const pixel = ISMOBILE ? 1 : Math.min(window.devicePixelRatio || 1, 2);

  const tooltipRef = useRef<HTMLDivElement>(null);

  const renderDataSource: Array<
    TRectItem & {
      data: TItem;
    }
  > = useMemo(() => {
    const maxCount = dataSource.reduce((acc, cur) => Math.max(acc, cur.count), 0);
    return dataSource.map((item) => {
      return {
        data: item,
        width: (96 + 4) * pixel,
        height: (96 + 4) * pixel,
        draw(ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.scale(pixel, pixel);
          // padding
          ctx.translate(2, 2);
          const radius = 12;
          const bg = loader.getBgFromRarity(item.rarity);
          if (!bg) return;
          if (bg) fillImageRoundRect(ctx, 0, 0, 96, 96, radius, bg, 0, 0, 112, 112);

          const itemImage = loader.getItemImageFromKey(item.key);
          if (itemImage) {
            fillImageRoundRect(
              ctx,
              0,
              0,
              96,
              96,
              radius,
              itemImage,
              0,
              0,
              itemImage.width,
              itemImage.height,
            );
          }

          ctx.font = `20px ${FONT_FAMILY}`;
          ctx.textBaseline = 'top';
          const countText = `×${item.count}`;
          const textInfo = ctx.measureText(countText);
          fillRoundRect(
            ctx,
            96 - textInfo.width - 4,
            96 - 24,
            textInfo.width + 4,
            24,
            8,
            'rgba(255, 255, 255, .7)',
          );
          ctx.fillStyle = '#000';
          ctx.fillText(countText, 96 - textInfo.width - 2, 96 - 22);
        },
        // scale: Math.sqrt(item.count / maxCount),
        scale: 1 / (1 - Math.log10(item.count / maxCount)),
      };
    });
  }, [dataSource]);

  useEffect(() => {
    const listener = throttle(() => {
      if (rectCloudRef.current) rectCloudRef.current.render();
    }, 30);
    loader.addListener(listener);
    return () => loader.removeListener(listener);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rectCloud = createRectCloud<
      TRectItem & {
        data: TItem;
      }
    >({
      canvas: canvas,
      background: '#fdfdfd',
      dataSource: renderDataSource,
      maxScale: 1.5,
      keyBy(item) {
        return item.data.key;
      },
      onHover(item, event) {
        if (!tooltipRef.current) return;
        const tooltipEl = tooltipRef.current;
        if (!item) {
          tooltipEl.style.opacity = '0';
          return;
        }
        const { data } = item;
        const tooltip = `${getItemNameByKey(data.key)} 获取次数: ${data.count}`;
        tooltipEl.style.opacity = '1';
        tooltipEl.innerText = tooltip;
        const tooltipRect = tooltipEl.getBoundingClientRect();
        const offsetX = Math.min(10, window.innerWidth - event.clientX - tooltipRect.width - 30);
        const offsetY = Math.min(20, window.innerHeight - event.clientY - tooltipRect.height - 30);
        tooltipEl.style.left = `${event.offsetX + offsetX}px`;
        tooltipEl.style.top = `${event.offsetY + offsetY}px`;
      },
    });

    rectCloudRef.current = rectCloud;
    rectCloud.render();

    const mouseoutListener = () => {
      if (!tooltipRef.current) return;
      const tooltipEl = tooltipRef.current;
      tooltipEl.style.opacity = '0';
    };

    canvas.addEventListener('mouseout', mouseoutListener);

    return () => {
      rectCloud.destroy();
      canvas.removeEventListener('mouseout', mouseoutListener);
    };
  }, []);

  useEffect(() => {
    if (rectCloudRef.current) rectCloudRef.current.updateData(renderDataSource);
  }, [renderDataSource]);

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width * pixel}
        height={height * pixel}
        style={{
          width: '100%',
        }}
      />
      <div ref={tooltipRef} css={tooltipCss} />
    </div>
  );
};
