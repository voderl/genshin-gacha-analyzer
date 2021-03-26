/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { ECharts } from 'echarts/core';
import { Data, DataItem } from 'types';
import { COLOR, FONT_FAMILY, SHOW_DATA_ALL_KEY } from 'const';
import { Alert, Switch } from 'antd';
import memoize from 'lodash/memoize';
import { getDateInfo } from './getDateInfo';
import { CollapseWorkSheet } from './CollapseWorkSheet';
import { useCacheMemo } from 'context/CacheContext';
import get from 'lodash/get';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
  BarChart,
]);
type TimelineProps = {
  onGetData: (key: string) => Data;
};
type DateInfo = {
  count: number;
  '5': number;
  '4': number;
  '3': number;
  day: string;
};
function calculateData(data: Data) {
  const countByDay: Array<DateInfo> = [];
  function addToList(current: DateInfo) {
    countByDay.push(current);
  }
  const format = (index: number) => data[index].时间.slice(0, 10);
  const initCurrent = () => ({
    count: 0,
    '5': 0,
    '4': 0,
    '3': 0,
    day: '',
  });
  let current = initCurrent();
  const walk = (item: DataItem) => {
    current.count += 1;
    (current as any)[item.星级] += 1;
  };
  for (let i = 0, len = data.length; i < len; i++) {
    const item = data[i];
    const day = format(i);
    if (current.day === day) {
      walk(item);
    } else {
      current.count && addToList(current);
      current = initCurrent();
      current.day = day;
      walk(item);
    }
  }
  current.count && addToList(current);
  return countByDay;
}
const barList = [
  ['3 星', '3', COLOR.THREE_STAR],
  ['4 星', '4', COLOR.FOUR_STAR],
  ['5 星', '5', '#FAC858'],
];

export const Timeline: FC<TimelineProps> = function ({ onGetData }) {
  const echartsWrapper = useRef<HTMLDivElement>(null);
  const myChartRef = useRef<ECharts>();
  const [hideZeroDay, setHideZeroDay] = useState(true);
  const [currentday, setCurrentDay] = useState<string>();

  // 获取数据，并写入缓存。
  const { getOption, getInfoByDay } = useCacheMemo(
    () => {
      function formatToEchartsOption(dataList: DateInfo[]) {
        return {
          xAxis: {
            type: 'category',
            data: dataList.map(({ day }) => day),
          },
          series: barList.map(([name, key, color], index) => {
            return {
              name,
              type: 'bar',
              stack: 'total',
              itemStyle: {
                color,
              },
              data: dataList.map((data: any) => data[key]),
            };
          }),
        };
      }
      function getData(isHideZeroDay: boolean) {
        if (!isHideZeroDay) {
          const countByDay: DateInfo[] = getData(true);
          // 如果中间日期需要显示
          const getDay = (data: DateInfo) => data.day;
          // 获取最开始一天和最后一天中间的日期
          const dateList: DateInfo[] = getDateInfo(
            getDay(countByDay[0]),
            getDay(countByDay[countByDay.length - 1]),
          ).map((day: string) => ({
            count: 0,
            '5': 0,
            '4': 0,
            '3': 0,
            day,
          }));
          let j = 0;
          for (let i = 0; i < countByDay.length; i++) {
            const day = getDay(countByDay[i]);
            while (day !== dateList[j].day) {
              j++;
              if (j >= dateList.length) break;
            }
            dateList[j] = countByDay[i];
          }
          return dateList;
        }
        return calculateData(onGetData(SHOW_DATA_ALL_KEY));
      }
      const getOption = function (isHideZeroDay: boolean) {
        return formatToEchartsOption(getData(isHideZeroDay));
      };
      let map: any;
      function getInfoByDay(day: string): DateInfo | undefined {
        if (map) return map[day];
        map = Object.create(null);
        getData(true).forEach((info) => (map[info.day] = info));
        return getInfoByDay(day);
      }
      return {
        getOption: memoize(getOption),
        getInfoByDay,
      };
    },
    [],
    'timeline',
  );
  useEffect(() => {
    let myChart: ECharts;
    if (echartsWrapper.current) {
      myChart = echarts.init(echartsWrapper.current);
      const textStyle = {
        fontFamily: FONT_FAMILY,
        fontWeight: 'normal',
      };
      const options = {
        textStyle,
        tooltip: {
          trigger: 'axis',
          formatter(series: any[]) {
            if (series.length === 0) return '';
            const day = series[0].axisValue;
            const info = getInfoByDay(day);
            const total = info ? info.count : 0;
            return `<div style="font-size:14px;color:#666;font-weight:400;line-height:1.5;">
              <div>${day}</div>
              <div>当日抽卡次数: <span style="font-weight:900">${total}<span></div>
              ${series
                .reverse()
                .map(
                  (data) => `<div>
                  ${data.marker}
                  <span style="margin-left:2px">${data.seriesName}</span>
                  <span style="float:right;margin-left:20px;font-weight:900;color=${data.color}">${data.value}</span>
                </div>`,
                )
                .join('')}</div>`;
          },
        },
        title: {
          left: 'center',
          text: `抽卡数据总览(共${onGetData(SHOW_DATA_ALL_KEY).length}抽)`,
          textStyle,
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
            },
            restore: {},
            saveAsImage: {},
          },
        },
        legend: {
          top: 25,
          data: barList.map(([name]) => name),
        },
        xAxis: {
          type: 'value',
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
          boundaryGap: false,
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100,
          },
          {
            start: 0,
            end: 100,
          },
        ],
      };
      options && myChart.setOption(options as any);
      myChart.getZr().on('click', function (params) {
        const pointInPixel = [params.offsetX, params.offsetY];
        if (myChart.containPixel('grid', pointInPixel)) {
          let xIndex = myChart.convertFromPixel({ seriesIndex: 0 }, [
            params.offsetX,
            params.offsetY,
          ])[0];
          const option = myChart.getOption();
          const day = get(option, `xAxis[0].data[${xIndex}]`) as string;
          if (day) setCurrentDay(day);
        }
      });
      myChartRef.current = myChart;
    }
    return () => {
      myChart && myChart.dispose();
    };
  }, []);
  useEffect(() => {
    if (myChartRef.current) {
      const option = getOption(hideZeroDay);
      myChartRef.current.setOption(option);
    }
  }, [hideZeroDay]);
  const handleChangeSwitch = useCallback((checked: boolean) => {
    setHideZeroDay(!checked);
  }, []);
  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        position: absolute;
      `}
    >
      <div
        css={css`
          width: 100%;
          display: flex;
          justify-content: center;
          background: #e6f7ff;
          margin: 0 0 20px;
          .ant-alert {
            background: #e6f7ff;
          }
        `}
      >
        <Alert
          message={<div>点击图中数据可以查看当天的抽卡记录</div>}
          type='info'
          banner
          showIcon
        />
      </div>
      <div>
        显示没有抽卡的日期: <Switch checked={!hideZeroDay} onChange={handleChangeSwitch} />
      </div>
      <div
        ref={echartsWrapper}
        css={css`
          width: 100%;
          height: 500px;
        `}
      ></div>
      {currentday && <CollapseWorkSheet onGetData={onGetData} day={currentday} />}
    </div>
  );
};
