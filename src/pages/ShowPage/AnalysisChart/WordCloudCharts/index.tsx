/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, Divider } from 'antd';
import { useCacheMemo } from 'context/CacheContext';
import { FC, useCallback, useRef } from 'react';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import { TParsedItem } from 'types';
import { useGlobalContext } from 'context/GlobalContext';
import { WordCloudChart } from './WordCloudChart';
import renderPngTip from 'utils/renderPngTip';
import downloadCanvas from 'utils/downloadCanvas';
import { drawEndLine } from '../renderToCanvas';

interface WordCloudChartsProps {}

const WordCloudCharts: FC<WordCloudChartsProps> = () => {
  const wordCloudWrapperRef = useRef<HTMLDivElement>(null);
  const { isVertical, parsedData } = useGlobalContext();
  const wordCloudData = useCacheMemo(
    () => {
      const data = parsedData.all;
      type Info = Pick<TParsedItem, 'key' | 'rarity' | 'type'> & {
        count: number;
      };

      const countMap: {
        [key: string]: Info;
      } = {};

      data.forEach((item) => {
        if (item.key in countMap) {
          const info = countMap[item.key];
          info.count += 1;
        } else
          countMap[item.key] = {
            key: item.key,
            rarity: item.rarity,
            type: item.type,
            count: 1
          }
      });
      const weapons: Info[] = [],
        characters: Info[] = [];
      Object.values(countMap).forEach((v) => {
        if (v.type === 'character') {
          characters.push(v);
        } else {
          weapons.push(v);
        }
      });
      const sorter = (a: Info, b: Info) => b.count - a.count;
      weapons.sort(sorter);
      characters.sort(sorter);
      return {
        weaponList: weapons,
        characterList: characters,
        filters: [3, 4, 5].map((star) => ({
          text: `${star} 星`,
          filter: (item: Info) => item.rarity === star,
          isSelected: star === 3 ? false : true,
        })),
      };
    },
    [],
    'wordCloudData',
  );
  const handleRenderWordCloudPng = useCallback(() => {
    renderPngTip((resolve, reject) => {
      if (!wordCloudWrapperRef.current) return reject();
      const canvasCollection = wordCloudWrapperRef.current.getElementsByTagName(
        'canvas',
      ) as HTMLCollectionOf<HTMLCanvasElement>;
      const canvas1 = canvasCollection[0];
      const selfWidth = canvas1.width,
        selfHeight = canvas1.height;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const { height: endLineHeight, draw: drawEnd } = drawEndLine(ctx);
      let width, height;
      if (isVertical) {
        width = selfWidth;
        height = 2 * selfHeight + endLineHeight;
      } else {
        width = 2 * selfWidth;
        height = selfHeight + endLineHeight;
      }
      const scale = 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const loc = {
        x: 0,
        y: 0,
      };
      ctx.fillStyle = '#fdfdfd';
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < canvasCollection.length; i++) {
        const currentCanvas = canvasCollection[i];
        ctx.drawImage(
          currentCanvas,
          0,
          0,
          selfWidth,
          selfHeight,
          loc.x * scale,
          loc.y * scale,
          selfWidth * scale,
          selfHeight * scale,
        );
        if (isVertical) loc.y += selfHeight;
        else loc.x += selfWidth;
      }
      drawEnd((width - 400) / 2, height - endLineHeight, 400);
      downloadCanvas(canvas, 'wordCloud.png', resolve);
    });
  }, [isVertical]);
  return (
    <div
      ref={wordCloudWrapperRef}
      css={css`
        text-align: center;
        margin: 24px 0;
      `}
    >
      <Divider>抽取数目展示图</Divider>
      <WordCloudChart
        type='character'
        dataSource={wordCloudData.characterList}
      />
      <WordCloudChart
        type="weapon"
        dataSource={wordCloudData.weaponList}
      />
      <br />
      <Button
        type='primary'
        onClick={handleRenderWordCloudPng}
        icon={<DownloadOutlined />}
        size='middle'
      >
        生成图片
      </Button>
    </div>
  );
};
export default WordCloudCharts;
