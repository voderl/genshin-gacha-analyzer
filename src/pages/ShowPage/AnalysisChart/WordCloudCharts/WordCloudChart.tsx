/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Checkbox } from 'antd';
import { ItemCloud } from 'components/ItemCloud';
import { FC, useCallback, useMemo, useState } from 'react';
import { TParsedItem } from 'types';

export interface WordCloudChartProps {
  type: 'weapon' | 'character';
  dataSource: Array<Pick<TParsedItem, 'key' | 'rarity' | 'type'>  & {
    count: number;
  }>
}

const options =  [3, 4, 5].map((rarity) => ({
  label: `${rarity} 星`,
  value: rarity,
}));

export const WordCloudChart: FC<WordCloudChartProps> = ({  dataSource, type }) => {
  const [checkedList, setCheckedList] = useState([4, 5]);
  const handleChange = useCallback((list) => {
    setCheckedList(list);
  }, []);

  const filteredDataSource = useMemo(() => {
    return dataSource.filter((item) => checkedList.includes(item.rarity));
  }, [dataSource, checkedList]);

  return (
    <div
      css={css`
        position: relative;
        display: inline-block;
        width: 100%;
        padding-top: 30px;
        max-width: 620px;
      `}
    >
      <Checkbox.Group
        options={type === 'character' ? options.slice(1) : options}
        value={checkedList}
        onChange={handleChange}
        css={css`
          position: absolute;
          right: 0px;
          top: 0px;
          z-index: 99;
          background-color: #f0f0f0;
          border-bottom-left-radius: 5px;
          padding: 5px 10px;
        `}
      />
      <ItemCloud dataSource={filteredDataSource} width={800} height={600}/>
    </div>
  );
};
