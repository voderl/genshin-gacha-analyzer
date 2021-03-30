/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
// @ts-ignore
import { Collapse } from 'antd';
import { WorkSheet } from 'components/WorkSheet';
import { SCHEMA_ALL, SHOW_DATA_ALL_KEY } from 'const';
import { Data } from 'types';
import parseToDate from 'utils/parseToDate';

const { Panel } = Collapse;

type CollapseWorkSheetProps = {
  day: string;
  onGetData: (key: string) => any;
};
export const CollapseWorkSheet: FC<CollapseWorkSheetProps> = function ({ day, onGetData }) {
  const [isCollapsed, setCollapsed] = useState(true);
  const handleCreateGrid = useCallback((grid) => {
    grid.orderBy = '星级';
    grid.orderDirection = 'desc'; /// descending order;
  }, []);
  const getData = useCallback((day) => {
    const allData: Data = onGetData(SHOW_DATA_ALL_KEY);
    const dayStart = +parseToDate(`${day} 00:00:00`);
    const dayEnd = dayStart + 3600 * 24 * 1000;
    const startIndex = allData.findIndex((data) => data.date >= dayStart);
    let endIndex;
    for (let i = startIndex; i < allData.length; i++) {
      if (allData[i].date >= dayEnd) {
        endIndex = i;
        break;
      }
    }
    return allData.slice(startIndex, endIndex);
  }, []);
  const handleChange = useCallback((key: any) => {
    if (key.length === 1) setCollapsed(false);
    else setCollapsed(true);
  }, []);
  return (
    <Collapse
      activeKey={isCollapsed ? '' : '1'}
      onChange={handleChange}
      css={css`
        margin-top: 12px;
        .ant-collapse-content-box {
          background: #f0f2f5;
        }
      `}
    >
      <Panel header={'点击展开 ' + day + ' 数据'} key='1'>
        <div
          css={css`
            width: 100%;
            height: 500px;
          `}
        >
          {!isCollapsed && (
            <WorkSheet data={getData(day)} schema={SCHEMA_ALL} onCreate={handleCreateGrid} />
          )}
        </div>
      </Panel>
    </Collapse>
  );
};
