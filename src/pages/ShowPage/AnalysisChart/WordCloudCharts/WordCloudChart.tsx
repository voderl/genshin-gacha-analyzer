/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Checkbox } from 'antd';
import { WordCloud, WordCloudProps } from 'components/WordCloud';
import { FC, useCallback, useMemo, useState } from 'react';

export interface WordCloudChartProps {
  list: ListItem[];
  filters: Filter[];
  formatter?: (item: ListItem) => string;
  color?: WordCloudProps['color'];
}

export type ListItem = [
  str: string,
  size: number,
  data: {
    size: number;
    count: number;
    star: number;
  },
];

type Filter = {
  text: string;
  filter: (item: any) => boolean;
  isSelected?: boolean;
};

function defaultFormatter(item: ListItem) {
  const [name, size, { count }] = item;
  return `${name} 获取次数: ${count}`;
}

export const WordCloudChart: FC<WordCloudChartProps> = ({ list, filters, formatter, color }) => {
  const { initialValue, initialList } = useMemo(() => {
    return {
      initialValue: filters.map((filter) => filter.text),
      initialList: filters
        .filter((filter) => !('isSelected' in filter) || filter.isSelected)
        .map((filter) => filter.text),
    };
  }, []);
  const [checkedList, setCheckedList] = useState(initialList);
  const handleChange = useCallback((list) => {
    setCheckedList(list);
  }, []);
  const filteredList = useMemo(() => {
    const filterArr: Filter['filter'][] = [];
    checkedList.forEach((v: string) => {
      const data = filters.find((item) => item.text === v);
      if (data) filterArr.push(data.filter);
    });
    const filter = (item: any) => filterArr.some((v) => v(item));
    const filteredList = list.filter(filter);
    const total = filteredList.reduce((acc, cur) => acc + cur[2].count, 0);
    filteredList.forEach((item) => {
      const { count, size } = item[2];
      item[1] = 250 * size * Math.pow(count / total, 1 / 2);
    });
    return filteredList;
  }, [list, checkedList]);
  return (
    <div
      css={css`
        position: relative;
        display: inline-block;
        width: 100%;
        max-width: 450px;
      `}
    >
      <Checkbox.Group
        options={initialValue}
        value={checkedList}
        onChange={handleChange}
        css={css`
          position: absolute;
          right: 0px;
          top: -15px;
          z-index: 9999;
          background-color: #f0f0f0;
          border-bottom-left-radius: 5px;
          padding: 5px 10px;
        `}
      />
      <WordCloud
        width='800'
        height='600'
        list={filteredList}
        formatter={formatter || defaultFormatter}
        color={color}
        css={css`
          margin-top: 15px;
          width: 100%;
        `}
      />
    </div>
  );
};
