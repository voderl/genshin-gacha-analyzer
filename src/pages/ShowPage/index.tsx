/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useContext, useMemo, useState, Suspense, lazy, memo } from 'react';
import { Menu, Layout, Spin } from 'antd';
import RawGithubCorner from 'react-github-corner';
import XLSXType, { WorkSheet as WorkSheetType } from 'xlsx/types';
import GlobalContext from 'context/GlobalContext';
import { SHOW_DATA_ALL_KEY } from 'const';
import { Data, DataItem } from 'types';
import { Achievements } from './Achievements';
import BarChartOutlined from '@ant-design/icons/BarChartOutlined';
import UnorderedListOutlined from '@ant-design/icons/UnorderedListOutlined';
import StarOutlined from '@ant-design/icons/StarOutlined';

const ShowData = lazy(() =>
  import(/* webpackPrefetch: true */ './ShowData').then((module) => ({
    default: module.ShowData,
  })),
);
const Timeline = lazy(() =>
  import(/* webpackPrefetch: true */ './Timeline').then((module) => ({
    default: module.Timeline,
  })),
);
const GithubCorner = memo(
  () => (
    <RawGithubCorner
      href='https://github.com/voderl/genshin-gacha-analyzer'
      target='_blank'
      direction='left'
      bannerColor='#70B7FD'
      octoColor='#fff'
      size={60}
    />
  ),
  () => true,
);
type ShowPageProps = {};
const { Content, Sider } = Layout;

export const ShowPage: FC<ShowPageProps> = function () {
  const { workbook } = useContext(GlobalContext);
  const sheetNames = (workbook as any).SheetNames;
  const getJson = useMemo(() => {
    const cache = Object.create(null);
    function getJson(key: string) {
      const XLSX: typeof XLSXType = (window as any).XLSX;
      if (key in cache) return cache[key];
      let data: Data;
      if (key === SHOW_DATA_ALL_KEY) {
        data = sheetNames.reduce((acc: Array<any>, cur: string) => acc.concat(getJson(cur)), []);
        data.sort((a, b) => (a.date === b.date ? a.总次数 - b.总次数 : a.date - b.date));
      } else {
        const sheet = (workbook as any).Sheets[key] as WorkSheetType;
        data = XLSX.utils.sheet_to_json(sheet);
        data.forEach((info: DataItem) => {
          info.pool = key;
          info.date = +new Date(info.时间);
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
    else if (key === 'timeline') return <Timeline onGetData={getJson} />;
    else if (key === 'achievements')
      return <Achievements onGetData={getJson} sheetNames={sheetNames} />;
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
        <GithubCorner />
        <Menu
          mode='inline'
          defaultSelectedKeys={['rawData']}
          onSelect={handleMenuChange}
          css={css`
            margin-top: 80px;
            .ant-menu-item {
              height: 60px;
              line-height: 60px;
            }
          `}
        >
          <Menu.Item key='timeline' icon={<BarChartOutlined />}>
            时间轴
          </Menu.Item>
          <Menu.Item key='rawData' icon={<UnorderedListOutlined />}>
            原数据
          </Menu.Item>
          <Menu.Item key='achievements' icon={<StarOutlined />}>
            成就表
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content
          css={css`
            margin: 0;
            position: relative;
          `}
        >
          <Suspense
            fallback={
              <Spin
                size='large'
                tip='加载中...'
                css={css`
                  display: block;
                  margin: 150px auto;
                `}
              />
            }
          >
            {renderContent(activeMenu)}
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};
