/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useMemo, useState, Suspense, lazy, memo } from 'react';
import { Layout, Spin } from 'antd';
import XLSXType, { WorkSheet as WorkSheetType } from 'xlsx/types';
import { useGlobalContext } from 'context/GlobalContext';
import { SHOW_DATA_ALL_KEY } from 'const';
import { Data, DataItem } from 'types';
import { Achievements } from './Achievements';
import CustomSider from './CustomSider';
import { CacheContextProvider } from 'context/CacheContext';

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
  const { workbook, isVertical } = useGlobalContext();
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
          (['总次数', '星级', '保底内'] as Array<keyof DataItem>).forEach((key) => {
            if (typeof info[key] !== 'number') (info as any)[key] = parseInt((info as any)[key]);
          });
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
