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
  MarkPointComponent,
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
import maxBy from 'lodash/maxBy';
import renderPngTip from 'utils/renderPngTip';
import downloadCanvas from 'utils/downloadCanvas';
import debounce from 'lodash/debounce';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkPointComponent,
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
        const max = maxBy(dataList, (o) => o.count);
        let markPoint: any;
        if (max) {
          markPoint = {
            label: {
              color: '#fff',
            },
            itemStyle: {
              color: COLOR.THREE_STAR,
            },
            data: [
              {
                name: '抽卡数最多',
                value: max.count,
                xAxis: dataList.indexOf(max),
                yAxis: max.count,
              },
            ],
          };
        }
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
              markPoint: key === '5' ? markPoint : undefined,
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

  const isHideZeroDayRef = useRef(hideZeroDay);
  const { legendFormatData, getTitle, debouncedFreshChart } = useMemo(() => {
    const legendFormatData = {
      current: {
        5: 0,
        4: 0,
        3: 0,
      },
    } as any;
    const debouncedFreshChart = debounce(() => {
      const myChart = myChartRef.current;
      if (!myChart) return;
      myChart.setOption({}, false, true);
    }, 100);
    const getTitle = () => {
      const myChart = myChartRef.current;
      if (!myChart) return 'chart not exist';
      const xData = getOption(isHideZeroDayRef.current).xAxis.data;
      const { startValue, endValue } = get((myChart as any).getModel(), 'option.dataZoom[0]') || {
        startValue: 0,
        endValue: xData.length - 1,
      };
      const startDay = xData[startValue];
      const endDay = xData[endValue];
      const data = xData.slice(startValue, endValue + 1).reduce(
        (acc, cur: string) => {
          const info = getInfoByDay(cur);
          if (info && info.count) {
            acc.count += info.count;
            acc['5'] += info['5'];
            acc['4'] += info['4'];
            acc['3'] += info['3'];
          }
          return acc;
        },
        {
          count: 0,
          5: 0,
          4: 0,
          3: 0,
        },
      );
      legendFormatData.current = {
        5: data['5'],
        4: data['4'],
        3: data['3'],
      };
      return `${startDay} - ${endDay} (共${data.count}抽)`;
    };
    return {
      legendFormatData,
      getTitle,
      debouncedFreshChart,
    };
  }, []);
  useEffect(() => {
    isHideZeroDayRef.current = hideZeroDay;
    if (myChartRef.current) {
      const option = getOption(hideZeroDay);
      myChartRef.current.setOption(option);
      myChartRef.current.setOption(
        {
          title: {
            text: getTitle(),
          },
        },
        false,
        true,
      );
    }
  }, [hideZeroDay]);
  useEffect(() => {
    let myChart: ECharts;
    if (echartsWrapper.current) {
      myChart = echarts.init(echartsWrapper.current);
      myChartRef.current = myChart;
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
          text: getTitle(),
          textStyle,
        },
        toolbox: {
          feature: {
            mySaveAsImage: {
              show: true,
              icon:
                'path://M4.7,22.9L29.3,45.5L54.7,23.4M4.6,43.6L4.6,58L53.8,58L53.8,43.6M29.2,45.1L29.2,0',
              title: '保存为图片',
              onclick() {
                const option = myChart.getOption();
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = Math.max(1200, myChart.getWidth());
                tempCanvas.height = Math.max(600, myChart.getHeight());
                const tempChart = echarts.init(tempCanvas);
                tempChart.setOption({
                  ...option,
                  toolbox: {},
                  dataZoom: (option as any).dataZoom[0],
                  animation: false,
                  backgroundColor: '#fff',
                  grid: {
                    left: '5%',
                    right: '5%',
                    bottom: 45,
                  },
                });
                renderPngTip((resolve) => {
                  downloadCanvas(tempCanvas, (option as any).title[0].text, () => {
                    resolve();
                    tempChart.dispose();
                    tempCanvas.width = 0;
                    tempCanvas.height = 0;
                  });
                });
              },
            },
          },
          right: '5%',
        },
        legend: {
          top: 25,
          data: barList.map(([name]) => name),
          formatter(name: string) {
            return `${name}(共${legendFormatData.current[name.charAt(0)]}个)`;
          },
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
        ...getOption(isHideZeroDayRef.current),
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
      myChart.on('datazoom', (e: any) => {
        const option = (myChart as any).getModel().option;
        option.title[0].text = getTitle();
        debouncedFreshChart();
      });
    }
    return () => {
      myChart && myChart.dispose();
    };
  }, []);
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
