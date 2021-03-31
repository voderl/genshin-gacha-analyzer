/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, Divider } from 'antd';
import { useCacheMemo } from 'context/CacheContext';
import { FC, useCallback, useRef } from 'react';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import { DataItem } from 'types';
import { SHOW_DATA_ALL_KEY } from 'const';
import { useGlobalContext } from 'context/GlobalContext';
import { ListItem, WordCloudChart } from './WordCloudChart';
// @ts-ignore
import randomColor from 'randomcolor';
import renderPngTip from 'utils/renderPngTip';
import downloadCanvas from 'utils/downloadCanvas';

interface WordCloudChartsProps {
  onGetData: (key: string) => DataItem[];
}

const WordCloudCharts: FC<WordCloudChartsProps> = ({ onGetData }) => {
  const wordCloudWrapperRef = useRef<HTMLDivElement>(null);
  const { isVertical } = useGlobalContext();
  const wordCloudData = useCacheMemo(
    () => {
      const data = onGetData(SHOW_DATA_ALL_KEY);
      type Info = {
        count: number;
        data: DataItem[];
        name: string;
        star: number;
        color: string;
        isCharacter: boolean;
      };
      const countMap: {
        [key: string]: Info;
      } = {};
      data.forEach((item) => {
        if (item.名称 in countMap) {
          const info = countMap[item.名称];
          info.count += 1;
          info.data.push(item);
        } else
          countMap[item.名称] = {
            count: 1,
            data: [item],
            name: item.名称,
            star: item.星级,
            color: randomColor({
              luminosity: 'dark',
            }),
            isCharacter: item.类别 === '角色',
          };
      });
      const weapons: Info[] = [],
        characters: Info[] = [];
      Object.values(countMap).forEach((v) => {
        if (v.isCharacter) {
          characters.push(v);
        } else {
          weapons.push(v);
        }
      });
      const sorter = (a: Info, b: Info) => b.star - a.star || b.count - a.count;
      weapons.sort(sorter);
      characters.sort(sorter);
      function getWordCloudList(data: Info[]): ListItem[] {
        return data.map((item) => {
          const { name, count, star } = item;
          return [
            name,
            1,
            {
              size: 1,
              count,
              star,
            },
          ];
        });
      }
      return {
        weaponList: getWordCloudList(weapons),
        characterList: getWordCloudList(characters),
        filters: [3, 4, 5].map((star) => ({
          text: `${star} 星`,
          filter: (item: ListItem) => item[2].star === star,
          isSelected: star === 3 ? false : true,
        })),
        color(name: string) {
          if (name in countMap) {
            const { color } = countMap[name];
            return color;
          }
          return '#fff';
        },
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
      let width, height;
      if (isVertical) {
        width = selfWidth;
        height = 2 * selfHeight;
      } else {
        width = 2 * selfWidth;
        height = selfHeight;
      }
      const canvas = document.createElement('canvas');
      const scale = 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d')!;
      const loc = {
        x: 0,
        y: 0,
      };
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
        list={wordCloudData.characterList}
        filters={wordCloudData.filters.slice(1)}
        color={wordCloudData.color}
      />
      <WordCloudChart
        list={wordCloudData.weaponList}
        filters={wordCloudData.filters}
        color={wordCloudData.color}
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
