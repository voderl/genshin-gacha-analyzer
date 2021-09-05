/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { message, Spin, Alert } from 'antd';
import { GlobalContextProvider, useGlobalContext } from './context/GlobalContext';
import { LoadPage } from './pages/LoadPage';
import { ShowPage } from './pages/ShowPage';

import './App.css';
import { decompressFromHash } from 'utils/compress';

const MergePage = lazy(() =>
  import('./pages/MergePage').then((module) => ({
    default: module.MergePage,
  })),
);

function App() {
  const { parsedData, page, updateParsedData } = useGlobalContext();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!parsedData) {
      try {
        let data = decompressFromHash();
        if (data) {
          updateParsedData(data);
          setError('');
        }
      } catch (error) {
        const info = '解析过程中出现错误，请检查链接是否完全复制，如需反馈请加群 853150041 ';
        setError(info);
        message.error(info);
      }
    }
  }, [window.location.hash]);

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
  return parsedData === null ? (
    <>
      {error && <Alert type='error' message={error} banner />}
      <LoadPage />
    </>
  ) : (
    <ShowPage />
  );
}
function WrappedApp() {
  return (
    <GlobalContextProvider>
      <App />
    </GlobalContextProvider>
  );
}
export default WrappedApp;
