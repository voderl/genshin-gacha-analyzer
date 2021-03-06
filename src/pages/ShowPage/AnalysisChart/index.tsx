/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, Divider, message } from 'antd';
import { useCacheContext } from 'context/CacheContext';
import { FC, useCallback, useMemo } from 'react';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import { DataItem } from 'types';
import { PoolAnalysis } from './PoolAnalysis';
import { renderToCanvas } from './renderToCanvas';
// @ts-ignore
import { saveAs } from 'file-saver';
import { ISMOBILE } from 'const';
import { useGlobalContext } from 'context/GlobalContext';
import { IconButton } from 'components/IconButton';

interface AnalysisChartProps {
  sheetNames: string[];
  onGetData: (key: string) => DataItem[];
}

export const AnalysisChart: FC<AnalysisChartProps> = ({ sheetNames, onGetData }) => {
  const dataArr = useMemo(() => {
    return sheetNames.map((key) => onGetData(key));
  }, [sheetNames]);
  const localCache = useCacheContext();
  const { isVertical } = useGlobalContext();
  const handleRenderPng = useCallback(() => {
    const key = 'renderChartPng';
    message.loading({
      content: '生成图片中...',
      key,
    });
    renderToCanvas(
      Object.values(localCache),
      isVertical,
      (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        try {
          canvas.toBlob(function (blob) {
            saveAs(blob, 'charts.png');
            message.success({
              content: '生成图片成功',
              key,
            });
          });
        } catch (e) {
          message.error({
            content: '生成图片失败，请重试或更换浏览器',
            key,
          });
          throw new Error(e);
        }
      },
    );
  }, [isVertical]);
  return (
    <div>
      <Divider>
        <span>
          此页面参考自：
          <a target='_blank' href='https://github.com/biuuu/genshin-gacha-export'>
            github链接
          </a>
        </span>
      </Divider>
      {ISMOBILE ? (
        <div
          css={css`
            position: absolute;
            right: 12px;
            z-index: 999;
          `}
        >
          <Button
            type='primary'
            onClick={handleRenderPng}
            icon={<DownloadOutlined />}
            size='middle'
            shape='circle'
          />
        </div>
      ) : (
        <div
          css={css`
            position: fixed;
            right: 64px;
            z-index: 999;
          `}
        >
          <IconButton
            icon={<DownloadOutlined />}
            onClick={handleRenderPng}
            tip='生成图片'
            placement='left'
          />
        </div>
      )}
      <div
        css={css`
          text-align: center;
          margin: 10px 0;
        `}
      >
        {sheetNames
          .map((key, index) => {
            const data = dataArr[index];
            if (!data || data.length === 0) return;
            return <PoolAnalysis key={key} sheetName={key} data={data} />;
          })
          .filter((v) => !!v)}
      </div>
      <div
        css={css`
          text-align: center;
          margin-bottom: 48px;
        `}
      >
        <Button type='primary' onClick={handleRenderPng} icon={<DownloadOutlined />} size='middle'>
          生成图片
        </Button>
      </div>
    </div>
  );
};
