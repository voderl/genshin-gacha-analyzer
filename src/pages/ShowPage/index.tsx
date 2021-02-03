/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Menu, Layout } from 'antd';
import XLSX, { WorkSheet as WorkSheetType } from 'xlsx';
import GlobalContext from 'context/GlobalContext';
import { SHOW_DATA_ALL_KEY } from 'const';
import { ShowData } from './ShowData';

type ShowPageProps = {};
const { Content, Sider } = Layout;

export const ShowPage: FC<ShowPageProps> = function () {
  const { workbook } = useContext(GlobalContext);
  const sheetNames = (workbook as any).SheetNames;
  const getJson = useMemo(() => {
    const cache = Object.create(null);
    function getJson(key: string) {
      if (key in cache) return cache[key];
      let data;
      if (key === SHOW_DATA_ALL_KEY) {
        data = sheetNames.reduce((acc: Array<any>, cur: string) => acc.concat(getJson(cur)), []);
      } else {
        const sheet = (workbook as any).Sheets[key] as WorkSheetType;
        data = XLSX.utils.sheet_to_json(sheet);
        data.forEach((info: any) => {
          info.pool = key;
        });
      }
      return (cache.key = data);
    }
    return getJson;
  }, [workbook]);
  const [activeMenu, setActiveMenu] = useState('rawData');
  const handleMenuChange = useCallback(({ key }: any) => {
    setActiveMenu(key);
  }, []);
  const renderContent = useCallback((key) => {
    if (key === 'rawData') return <ShowData onGetData={getJson} tabs={sheetNames} />;
    else return <div>暂无</div>;
  }, []);
  return (
    <Layout
      css={css`
        overflow: hidden;
      `}
    >
      <Sider
        theme='light'
        width='20%'
        style={{
          height: '100vh',
        }}
      >
        <div className='logo' />
        <Menu
          mode='inline'
          defaultSelectedKeys={['rawData']}
          onSelect={handleMenuChange}
          css={css`
            margin-top: 60px;
            .ant-menu-item {
              height: 60px;
              line-height: 60px;
            }
          `}
        >
          <Menu.Item key='timeline'>时间轴</Menu.Item>
          <Menu.Item key='rawData'>原数据</Menu.Item>
          <Menu.Item key='achievements'>成就表</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content
          css={css`
            margin: 0;
            position: relative;
          `}
        >
          {renderContent(activeMenu)}
        </Content>
      </Layout>
    </Layout>
  );
};
