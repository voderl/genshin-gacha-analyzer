/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Divider } from 'antd';
import { FC, useMemo } from 'react';
import { DataItem } from 'types';
import { PoolAnalysis } from './PoolAnalysis';

interface AnalysisChartProps {
  sheetNames: string[];
  onGetData: (key: string) => DataItem[];
}

export const AnalysisChart: FC<AnalysisChartProps> = ({ sheetNames, onGetData }) => {
  const dataArr = useMemo(() => {
    return sheetNames.map((key) => onGetData(key));
  }, [sheetNames]);
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
    </div>
  );
};
