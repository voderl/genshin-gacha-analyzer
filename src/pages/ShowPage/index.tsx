/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useMemo, useState, Suspense, lazy, memo } from 'react';
import { Layout, Spin } from 'antd';
import { useGlobalContext } from 'context/GlobalContext';
import { POOL_NAME_TO_TYPE, POOL_TYPE_TO_NAME, SHOW_DATA_ALL_KEY } from 'const';
import { Data, DataItem } from 'types';
import { Achievements } from './Achievements';
import CustomSider from './CustomSider';
import { CacheContextProvider, clearGlobalCache } from 'context/CacheContext';

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
const AnalysisChart = lazy(() =>
  import(/* webpackPrefetch: true */ './AnalysisChart').then((module) => ({
    default: module.AnalysisChart,
  })),
);

type ShowPageProps = {};
const { Content } = Layout;

export const ShowPage: FC<ShowPageProps> = function () {
  const { parsedData, isVertical } = useGlobalContext();
  const sheetNames = Object.values(POOL_TYPE_TO_NAME);
  const getJson = useMemo(() => {
    clearGlobalCache();
    const cache = Object.create(null);
    function getJson(key: string) {
      if (key in cache) return cache[key];
      let data: Data;
      if (key === SHOW_DATA_ALL_KEY) {
        data = sheetNames.reduce((acc: Array<any>, cur: string) => acc.concat(getJson(cur)), []);
        data.sort((a, b) => (a.date === b.date ? a.总次数 - b.总次数 : a.date - b.date));
      } else {
        const type = (POOL_NAME_TO_TYPE as any)[key];
        data = (parsedData as any)[type];
      }
      return (cache.key = data);
    }
    return getJson;
  }, [parsedData]);
  const [activeMenu, setActiveMenu] = useState('analysisChart');
  const handleMenuChange = useCallback(({ key }: any) => {
    setActiveMenu(key);
  }, []);
  const renderContent = useCallback((key) => {
    if (key === 'rawData') return <ShowData onGetData={getJson} tabs={sheetNames} />;
    else if (key === 'analysisChart')
      return <AnalysisChart sheetNames={sheetNames} onGetData={getJson} />;
    else if (key === 'timeline') return <Timeline onGetData={getJson} />;
    else if (key === 'achievements')
      return <Achievements onGetData={getJson} sheetNames={sheetNames} />;
    else return <div>暂无</div>;
  }, []);
  return (
    <Layout
      css={css`
        width: 100%;
        height: 100%;
        position: absolute;
        display: flex;
      `}
      style={{
        flexDirection: isVertical ? 'column' : 'row',
      }}
    >
      <CustomSider
        isVertical={isVertical}
        onMenuChange={handleMenuChange}
        activeMenu={activeMenu}
      />
      <Content
        css={css`
          margin: 0;
          position: relative;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
        `}
      >
        <CacheContextProvider path={activeMenu}>
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
        </CacheContextProvider>
      </Content>
    </Layout>
  );
};
