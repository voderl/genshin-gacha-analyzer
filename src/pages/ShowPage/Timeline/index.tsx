/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { ECharts } from 'echarts/core';
import { Data } from 'types';
import { COLOR, FONT_FAMILY, SHOW_DATA_ALL_KEY } from 'const';
import { Alert, Switch } from 'antd';
import memoize from 'lodash/memoize';
import { getDateInfo } from './getDateInfo';
import { CollapseWorkSheet } from './CollapseWorkSheet';
import { useCacheMemo } from 'context/CacheContext';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer,
  BarChart,
]);
type TimelineProps = {
  onGetData: (key: string) => Data;
};
function calculateData(data: Data) {
  const countByDay: Array<any> = [];
  function addToList(current: { count: number; day: string; existFiveStar: boolean }) {
    if (current.existFiveStar) {
      countByDay.push({
        value: [current.day, current.count],
        itemStyle: {
          color: COLOR.FIVE_STAR,
        },
      });
    } else countByDay.push([current.day, current.count]);
  }
  const format = (index: number) => data[index].时间.slice(0, 10);
  const initCurrent = () => ({
    count: 0,
    day: '',
    existFiveStar: false,
  });
  let current = initCurrent();
  for (let i = 0, len = data.length; i < len; i++) {
    const day = format(i);
    if (current.day === day) {
      current.count += 1;
    } else {
      current.count && addToList(current);
      current = initCurrent();
      current.count += 1;
      current.day = day;
    }
    if (!current.existFiveStar && data[i].星级 === 5) current.existFiveStar = true;
  }
  current.count && addToList(current);
  return countByDay;
}
export const Timeline: FC<TimelineProps> = function ({ onGetData }) {
  const echartsWrapper = useRef<HTMLDivElement>(null);
  const myChartRef = useRef<ECharts>();
  const [hideZeroDay, setHideZeroDay] = useState(true);
  const [currentday, setCurrentDay] = useState<string>();

  // 获取数据，并写入缓存。
  const getData = useCacheMemo(
    () => {
      let getData: any;
      getData = memoize((isHideZeroDay: boolean) => {
        if (!isHideZeroDay) {
          const countByDay = getData(true);
          // 如果中间日期需要显示
          const getDay = (data: any) => (Array.isArray(data) ? data[0] : data.value[0]);
          // 获取最开始一天和最后一天中间的日期
          const dateList = getDateInfo(
            getDay(countByDay[0]),
            getDay(countByDay[countByDay.length - 1]),
          ).map((day: string) => [day, 0]);
          let j = 0;
          for (let i = 0; i < countByDay.length; i++) {
            const day = getDay(countByDay[i]);
            while (day !== dateList[j][0]) {
              j++;
              if (j >= dateList.length) break;
            }
            dateList[j] = countByDay[i];
          }
          return dateList;
        }
        return calculateData(onGetData(SHOW_DATA_ALL_KEY));
      });
      return getData;
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
          position: function (pt: any) {
            return [pt[0], '10%'];
          },
        },
        title: {
          left: 'center',
          text: '抽卡数据总览',
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
        xAxis: {
          type: 'category',
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
        series: [
          {
            name: '当日抽卡次数',
            type: 'bar',
            data: getData(true),
          },
        ],
      };
      options && myChart.setOption(options as any);
      myChart.on('click', function (params: any) {
        setCurrentDay(params.name);
      });
      myChartRef.current = myChart;
    }

    return () => {
      myChart && myChart.dispose();
    };
  }, []);
  useEffect(() => {
    if (myChartRef.current) {
      myChartRef.current.setOption({
        title: {
          text: `抽卡数据总览(共${onGetData(SHOW_DATA_ALL_KEY).length}抽)`,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
        },
        series: [
          {
            name: '当日抽卡次数',
            type: 'bar',
            data: getData(hideZeroDay),
          },
        ],
      });
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
