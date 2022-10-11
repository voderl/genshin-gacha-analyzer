/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { PieChart } from 'components/PieChart';
import { COLOR, FONT_FAMILY } from 'const';
import { ECharts } from 'echarts/core';
import takeRight from 'lodash/takeRight';
import meanBy from 'lodash/meanBy';
import { FC, useCallback, useRef } from 'react';
import { DataItem, TPoolType } from 'types';
import { timeFormatter, percent, getColorByPercent } from './utils';
import { useCacheMemo } from 'context/CacheContext';
// @ts-ignore
import LazyLoad from 'react-lazyload';
import { getPoolName, isWeapon } from 'utils';
import { i18n } from 'utils/i18n';

interface PoolAnalysisProps {
  poolType: TPoolType;
  data: DataItem[];
}

export const PoolAnalysis: FC<PoolAnalysisProps> = ({ poolType, data }) => {
  const info = useCacheMemo(
    () => {
      // 解析数据
      const poolMax = poolType === 'weapon' ? 80 : 90;
      const keys = ['character5', 'weapon5', 'character4', 'weapon4', 'weapon3'];
      const langs = [i18n`5星角色`, i18n`5星武器`, i18n`4星角色`, i18n`4星武器`, i18n`3星武器`];
      const colors = ['#fac858', '#ee6666', '#5470c6', '#91cc75', '#73c0de'];
      const colorByKey = Object.fromEntries(keys.map((key, index) => [key, colors[index]]));
      const countByKey = Object.fromEntries(keys.map((key) => [key, 0]));
      const langByKey = Object.fromEntries(keys.map((key, index) => [key, langs[index]]));
      const fiveStarHistory: DataItem[] = [];
      data.forEach((item) => {
        if (item.rarity === 5) fiveStarHistory.push(item);
        countByKey[`${isWeapon(item) ? 'weapon' : 'character'}${item.rarity}`] += 1;
      });
      const lastFiveStar = fiveStarHistory.length === 0 ? null : takeRight(fiveStarHistory)[0];
      const leftCount = lastFiveStar
        ? data.length - data.lastIndexOf(lastFiveStar!) - 1
        : data.length;
      const chartDataList = keys.filter((key) => countByKey[key] !== 0);
      const chartData = chartDataList.map((key) => ({
        value: countByKey[key],
        name: langByKey[key],
      }));
      const chartColors = chartDataList.map((key) => colorByKey[key]);
      return {
        name: getPoolName(poolType),
        chartSelected: {
          [langByKey['weapon3']]: data.length > 20 ? false : true,
        },
        poolMax,
        chartData,
        chartColors,
        fromTime: data[0].date,
        toTime: data[data.length - 1].date,
        totalCount: data.length,
        leftCount,
        fiveStarCount: fiveStarHistory.length,
        fourStarCount: countByKey['weapon4'] + countByKey['character4'],
        threeStarCount: countByKey['weapon3'],
        fiveStarHistory,
        fiveStarAverage: meanBy(fiveStarHistory, (o) => o.pity),
      };
    },
    [data],
    poolType,
  );
  const chartRef = useRef<ECharts>();
  const handlePieChartCreate = useCallback(
    (chart: ECharts) => {
      chartRef.current = chart;
      const textStyle = {
        fontFamily: FONT_FAMILY,
        fontStyle: 'normal',
      };
      chart.setOption({
        textStyle: {
          fontFamily: FONT_FAMILY,
          fontStyle: 'normal',
        },
        title: {
          text: info.name,
          left: 'center',
          textStyle,
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: '10%',
          left: 'center',
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
    },
    [info],
  );
  const getColorByCount = (count: number) => {
    return getColorByPercent(count / info.poolMax);
  };
  function renderPercent(title: string, count: number, color?: string) {
    return (
      <>
        <span style={color ? { color } : void 0}>
          <span
            css={css`
              display: inline-block;
              width: 100px;
            `}
          >
            {title}：{count}
          </span>
          [{percent(count, info.totalCount)}]
        </span>
        <br />
      </>
    );
  }
  function renderColor(text: string | number, color: string) {
    return <span style={{ color }}> {text} </span>;
  }
  function renderItem(item: DataItem) {
    return (
      <span
        key={item.total}
        style={{
          color: getColorByCount(item.pity),
        }}
        css={css`
          margin: 4px;
        `}
      >
        {item.name}[{item.pity}]
      </span>
    );
  }
  return (
    <div
      css={css`
        display: inline-block;
        width: 100%;
        max-width: 450px;
        text-align: left;
        vertical-align: top;
      `}
    >
      <LazyLoad height={300} once scrollContainer={'.ant-layout-content'}>
        <PieChart
          css={css`
            height: 300px;
          `}
          onCreate={handlePieChartCreate}
        />
      </LazyLoad>
      <div
        css={css`
          padding: 0 50px;
        `}
      >
        <p
          css={css`
            text-align: center;
            span {
              color: grey;
            }
          `}
        >
          <span>{timeFormatter(info.fromTime)}</span>
          <span> - </span>
          <span>{timeFormatter(info.toTime)}</span>
        </p>
        <p>
          <span>
            一共抽取{renderColor(info.totalCount, '#1890ff')}次, 已累计
            {renderColor(info.leftCount, getColorByCount(info.leftCount))}抽未出5星
          </span>
        </p>
        <p>
          {[
            renderPercent('5星', info.fiveStarCount, COLOR.FIVE_STAR),
            renderPercent('4星', info.fourStarCount, COLOR.FOUR_STAR),
            renderPercent('3星', info.threeStarCount, COLOR.THREE_STAR),
          ]}
        </p>
        {info.fiveStarHistory.length !== 0 && (
          <>
            <p>
              5星历史记录：
              {info.fiveStarHistory.map((item) => renderItem(item))}
            </p>
            <p>
              5星平均出货次数：
              {renderColor(info.fiveStarAverage.toFixed(2), getColorByCount(info.fiveStarAverage))}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
