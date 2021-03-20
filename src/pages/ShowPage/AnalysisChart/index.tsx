/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, Divider, message } from 'antd';
import { useCacheContext, useCacheMemo } from 'context/CacheContext';
import { FC, useCallback, useMemo } from 'react';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import { DataItem } from 'types';
import { PoolAnalysis } from './PoolAnalysis';
import { renderToCanvas } from './renderToCanvas';
// @ts-ignore
import { saveAs } from 'file-saver';
import { ISMOBILE, SHOW_DATA_ALL_KEY } from 'const';
import { useGlobalContext } from 'context/GlobalContext';
import { IconButton } from 'components/IconButton';
import { FriendLinks } from 'components/FriendLinks';
import { ListItem, WordCloudChart } from './WordCloudChart';
// @ts-ignore
import randomColor from 'randomcolor';

interface AnalysisChartProps {
  sheetNames: string[];
  onGetData: (key: string) => DataItem[];
}

export const AnalysisChart: FC<AnalysisChartProps> = ({ sheetNames, onGetData }) => {
  const dataArr = useMemo(() => {
    return sheetNames.map((key) => onGetData(key));
  }, [sheetNames]);
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
  const localCache = useCacheContext();
  const { isVertical } = useGlobalContext();
  const handleRenderPng = useCallback(() => {
    const key = 'renderChartPng';
    message.loading({
      content: '生成图片中...',
      key,
    });
    renderToCanvas(
      sheetNames.map((key: string) => localCache[key]),
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
      <Divider>抽取数目展示图</Divider>
      <div
        css={css`
          text-align: center;
          margin: 24px 0;
        `}
      >
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
      </div>
      <FriendLinks mode='bottom' />
    </div>
  );
};
