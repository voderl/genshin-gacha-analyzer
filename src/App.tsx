/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { GlobalContextProvider, useGlobalContext } from './context/GlobalContext';
import { LoadPage } from './pages/LoadPage';
import { ShowPage } from './pages/ShowPage';

import './App.css';

const MergePage = lazy(() =>
  import('./pages/MergePage').then((module) => ({
    default: module.MergePage,
  })),
);

function App() {
  const { parsedData, page } = useGlobalContext();

  if (page === 'merge')
    return (
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
        <MergePage />
      </Suspense>
    );
  return parsedData === null ? <LoadPage /> : <ShowPage />;
}
function WrappedApp() {
  return (
    <GlobalContextProvider>
      <App />
    </GlobalContextProvider>
  );
}
export default WrappedApp;
