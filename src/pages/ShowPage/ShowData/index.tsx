/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Select, Tabs } from 'antd';
import ItemList, { useIsClientWidthMoreThan } from 'components/ItemList';
import { useGlobalContext } from 'context/GlobalContext';
import { Filter } from './Filter';
import { ISMOBILE, POOL_TYPES } from 'const';
import { TPoolType } from 'types';
import { getPoolName } from 'utils';
import { i18n } from 'utils/i18n';

type ShowDataProps = {};
const { TabPane } = Tabs;

const tabsCss = css`
  .ant-tabs-nav {
    height: 64px;
    margin-bottom: 0px;
  }
`;

const selectCss = css`
  width: 200px;
  padding: 16px 0px;
  margin: 0 20px;
`;

const tabOptions = POOL_TYPES.map((value) => ({
  label: getPoolName(value),
  value,
})).concat({
  label: i18n`全部`,
  value: 'all',
} as any);

export const ShowData: FC<ShowDataProps> = function () {
  const [activeKey, setActiveKey] = useState<TPoolType | 'all'>(POOL_TYPES[0]);

  const isWidthEnough = useIsClientWidthMoreThan(600);

  const handleChange = useCallback((key) => {
    setActiveKey(key);
  }, []);

  // filter为函数，因此不能直接使用useState，为了页面能更新，不使用ref
  const [filter, setFilter] = useState<{
    current: any;
  }>({
    current: void 0,
  });
  const handleFilterChange = useCallback((filter) => {
    setFilter({
      current: filter,
    });
  }, []);
  const { parsedData } = useGlobalContext();

  const data = useMemo(() => {
    const data = parsedData[activeKey];
    if (!filter.current) return data;
    return data.filter(filter.current);
  }, [filter.current, activeKey, parsedData]);

  return (
    <div>
      {isWidthEnough ? (
        <Tabs
          className='affix'
          tabBarExtraContent={
            <Filter
              data={data}
              style={{
                width: 100,
              }}
              onChange={handleFilterChange}
              activeKey={activeKey}
            />
          }
          style={{
            top: 0,
            maxWidth: 800,
            margin: 'auto',
          }}
          activeKey={activeKey}
          onChange={handleChange}
          size={ISMOBILE ? 'middle' : 'large'}
          centered
          css={tabsCss}
        >
          {tabOptions.map(({ label, value }) => (
            <TabPane tab={label} key={value} />
          ))}
        </Tabs>
      ) : (
        <div
          className='affix'
          style={{
            top: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <Select
            options={tabOptions}
            onChange={handleChange}
            value={activeKey}
            onSelect={handleChange}
            css={selectCss}
          />
          <Filter
            data={data}
            style={{
              width: 100,
            }}
            onChange={handleFilterChange}
            activeKey={activeKey}
          />
        </div>
      )}
      <ItemList dataSource={data} isShowPoolType={activeKey === 'all'} headerStickyTop={64} />
    </div>
  );
};
