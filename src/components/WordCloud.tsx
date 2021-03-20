/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FONT_FAMILY } from 'const';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
// @ts-ignore
import wordCloud from 'wordcloud';
import throttle from 'lodash/throttle';

export interface WordCloudProps {
  width: number | string;
  height: number | string;
  list: any[];
  color?: ((name: string) => string) | string;
  formatter?: (item: any) => string;
  [key: string]: any;
}

function defaultFormatter(item: any[]) {
  return `${item[0]} 获取次数 ${item[1]}`;
}
export const WordCloud: FC<WordCloudProps> = ({
  width,
  height,
  list,
  color,
  formatter,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    left?: number;
    top?: number;
    text: string;
  }>({
    text: '',
  });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const visibleRef = useRef(tooltipVisible);
  useEffect(() => {
    visibleRef.current = tooltipVisible;
  }, [tooltipVisible]);
  const hover = useMemo(() => {
    return throttle(function hover(item: any, dimension: any, event: MouseEvent) {
      if (item === undefined) setTooltipVisible(false);
      else if (Array.isArray(item)) {
        let text = (formatter || defaultFormatter)(item);
        const tootipEl = tooltipRef.current!;
        if (!tootipEl) return;
        // 确保tooltip被限制在viewport中
        tootipEl.innerHTML = text;
        const { width, height } = tootipEl.getBoundingClientRect();
        const { clientX, clientY } = event;
        const { clientWidth, clientHeight } = document.body;
        let offsetX = Math.min(10, clientWidth - clientX - width - 30);
        let offsetY = Math.min(20, clientHeight - clientY - height - 30);
        if (!visibleRef.current) {
          setTooltip({
            text,
          });
        }
        setTooltip({
          left: event.offsetX + offsetX,
          top: event.offsetY + offsetY,
          text,
        });
        setTooltipVisible(true);
      }
    }, 100);
  }, [formatter]);
  useEffect(() => {
    const timer = setTimeout(() => {
      wordCloud(canvasRef.current, {
        gridSize: 12,
        list: list,
        fontFamily: FONT_FAMILY,
        color: color || 'random-dark',
        backgroundColor: '#f9f9f9',
        rotateRatio: 0,
        hover,
        drawOutOfBound: false,
        shrinkToFit: false,
      });
    });
    return () => {
      // wordCloud.stop();
      clearTimeout(timer);
    };
  }, [list, hover, color]);
  return (
    <div
      css={css`
        position: relative;
      `}
      {...props}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        css={css`
          width: 100%;
        `}
      ></canvas>
      <div
        ref={tooltipRef}
        css={css`
          background-color: rgba(0, 0, 0, 0.8);
          color: #fff;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 14px;
          line-height: 1.4;
          transition: left 0.1s, top 0.1s, z-index 0.2s, opacity 0.2s;
          position: absolute;
          white-space: nowrap;
          z-index: 999;
        `}
        style={{
          left: tooltip.left,
          top: tooltip.top,
          zIndex: tooltipVisible ? 999 : -1,
          opacity: tooltipVisible ? 1 : 0,
          fontFamily: FONT_FAMILY,
        }}
        dangerouslySetInnerHTML={{
          __html: tooltip.text || '',
        }}
      />
    </div>
  );
};
