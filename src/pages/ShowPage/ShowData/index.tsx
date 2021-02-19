/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Tabs } from 'antd';
import { SCHEMA, SCHEMA_ALL, SHOW_DATA_ALL_KEY } from 'const';
import { WorkSheet } from 'components/WorkSheet';
import { Filter } from './Filter';
import { DataItem } from 'types';

type ShowDataProps = {
  onGetData: (key: string) => any;
  tabs: Array<string>;
};
const { TabPane } = Tabs;

function makeFilter(array: any[], format?: (v: any) => any) {
  const handle = (v: any) => (typeof v === 'string' ? '"' + v + '"' : v);
  const expr =
    'return ' + array.map((value) => `v===${handle(format ? format(value) : value)}`).join('||');
  return new Function('v', expr);
}
export const ShowData: FC<ShowDataProps> = function ({ onGetData, tabs }) {
  const [activeKey, setActiveKey] = useState(tabs[0]);
  const handleChange = useCallback((key) => {
    setActiveKey(key);
  }, []);
  // filter为函数，因此不能直接使用useState，为了页面能更新，不使用ref
  const [filter, setFilter] = useState<{
    current: any;
  }>({
    current: void 0,
  });
  const handleFilterChange = useCallback((v) => {
    const matchs: any[] = [];
    if (v.type.length !== 0) {
      const mapping = {
        weapon: '武器',
        character: '角色',
      };
      const compare = makeFilter(v.type, (key: keyof typeof mapping) => mapping[key]);
      matchs.push((data: DataItem) => compare(data.类别));
    }
    if (v.star.length !== 0) {
      const compare = makeFilter(v.star, (key: string) => parseInt(key));
      matchs.push((data: DataItem) => compare(data.星级));
    }
    if (v.search) {
      const filterString = function (value: string, filterFor: string) {
        var filterRegExp,
          regEnd = /\/(i|g|m)*$/,
          pattern = regEnd.exec(filterFor),
          flags = pattern ? pattern[0].substring(1) : '',
          flagLength = flags.length;
        if (filterFor.substring(0, 1) === '/' && pattern) {
          try {
            filterRegExp = new RegExp(
              filterFor.substring(1, filterFor.length - (flagLength + 1)),
              flags,
            );
          } catch (e) {
            return;
          }
          return filterRegExp.test(value);
        }
        return value.toString
          ? value.toString().toLocaleUpperCase().indexOf(filterFor.toLocaleUpperCase()) !== -1
          : false;
      };
      matchs.push((data: DataItem) => filterString(data.名称, v.search));
    }
    const filter =
      matchs.length === 0
        ? undefined
        : (data: DataItem) => {
            return matchs.every((func) => func(data));
          };
    setFilter({
      current: filter,
    });
  }, []);
  const data = useMemo(() => {
    const data = onGetData(activeKey);
    if (!filter.current) return data;
    return data.filter(filter.current);
  }, [filter.current, activeKey]);
  return (
    <div
      css={css`
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      <Tabs
        activeKey={activeKey}
        onChange={handleChange}
        size='large'
        centered
        css={css`
          .ant-tabs-nav {
            background: #fff;
            height: 64px;
          }
        `}
      >
        {tabs.map((name: string) => (
          <TabPane tab={name} key={name} />
        ))}
        <TabPane tab={SHOW_DATA_ALL_KEY} key={SHOW_DATA_ALL_KEY} />
        <Filter onChange={handleFilterChange} />
      </Tabs>
      <WorkSheet data={data} schema={activeKey === SHOW_DATA_ALL_KEY ? SCHEMA_ALL : SCHEMA} />
    </div>
  );
};
