/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useMemo, useState, Suspense, lazy, memo } from 'react';
import { Layout, Spin } from 'antd';
import { useGlobalContext } from 'context/GlobalContext';
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
  const { isVertical } = useGlobalContext();
  const [activeMenu, setActiveMenu] = useState('analysisChart');
  const handleMenuChange = useCallback(({ key }: any) => {
    setActiveMenu(key);
  }, []);
  const renderContent = useCallback((key) => {
    if (key === 'rawData') return <ShowData />;
    else if (key === 'analysisChart') return <AnalysisChart />;
    else if (key === 'timeline') return <Timeline />;
    else if (key === 'achievements') return <Achievements />;
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
