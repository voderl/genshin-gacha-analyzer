/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useCallback, useState } from 'react';
import { Tabs } from 'antd';
import { SHOW_DATA_ALL_KEY } from 'const';
import { WorkSheet } from 'components/WorkSheet';

type ShowDataProps = {
  onGetData: (key: string) => any;
  tabs: Array<string>;
};
const { TabPane } = Tabs;

const schema = [
  { name: '时间', type: 'string', width: 180 },
  { name: '编号', type: 'number', hidden: true, width: 120 },
  { name: '名称', type: 'string', width: 130 },
  { name: '类别', type: 'string', width: 50 },
  { name: '星级', type: 'number', width: 50 },
  { name: '总次数', type: 'number', hidden: true, width: 100 },
  { name: '保底内', type: 'number', width: 80 },
];
const schemaAll = (schema as any).concat({
  name: 'pool',
  title: '池子名称',
  type: 'string',
  width: 120,
});
export const ShowData: FC<ShowDataProps> = function ({ onGetData, tabs }) {
  const [activeKey, setActiveKey] = useState(tabs[0]);
  const handleChange = useCallback((key) => {
    setActiveKey(key);
  }, []);
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
      </Tabs>
      <WorkSheet
        data={onGetData(activeKey)}
        schema={activeKey === SHOW_DATA_ALL_KEY ? schemaAll : schema}
      />
    </div>
  );
};
