/** @jsxImportSource @emotion/react */
import React, { FC, useCallback } from 'react';
import { Typography } from 'antd';
import ItemList from 'components/ItemList';
import { useGlobalContext } from 'context/GlobalContext';
import { Data } from 'types';
import parseToDate from 'utils/parseToDate';

type DayItemListProps = {
  day: string;
};
export const DayItemList: FC<DayItemListProps> = function ({ day }) {
  const { parsedData } = useGlobalContext();
  const getData = useCallback((day) => {
    const allData: Data = parsedData.all;
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
  return (
    <div>
      <Typography.Title
        className='affix'
        style={{
          top: 0,
          margin: 'auto',
          width: '800px',
          backgroundColor: '#fcfcfc',
          paddingTop: 12,
        }}
        level={3}
      >
        {day + ' 数据'}
      </Typography.Title>
      <ItemList dataSource={getData(day)} isShowPoolType={true} headerStickyTop={44} />
    </div>
  );
};
