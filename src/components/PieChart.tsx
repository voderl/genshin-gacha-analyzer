/** @jsxImportSource @emotion/react */
import { FC, useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart as EchartsPieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { ECharts } from 'echarts/core';
import throttle from 'lodash/throttle';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, EchartsPieChart, CanvasRenderer]);

interface PieChartProps {
  onCreate: (chart: ECharts) => void;
  [key: string]: any;
}

export const PieChart: FC<PieChartProps> = ({ onCreate, ...props }) => {
  const echartsWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let myChart: ECharts;
    let resize: any;
    if (echartsWrapperRef.current) {
      myChart = echarts.init(echartsWrapperRef.current);
      onCreate(myChart);
      resize = throttle(() => {
        myChart.resize();
      }, 100);
      window.addEventListener('resize', resize);
    }
    return () => {
      if (myChart) {
        myChart.dispose();
        window.removeEventListener('resize', resize);
      }
    };
  }, []);
  return <div ref={echartsWrapperRef} {...props}></div>;
};
