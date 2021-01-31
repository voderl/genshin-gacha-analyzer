/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useContext, useState } from 'react';
import GlobalContext from './context/GlobalContext';
import { LoadPage } from './pages/LoadPage';
import { ShowPage } from './pages/ShowPage';

import './App.css';
import { WorkBook } from 'xlsx/types';

function App() {
  const { workbook } = useContext(GlobalContext);
  let page;
  if (workbook === null) {
    page = <LoadPage />;
  } else page = <ShowPage />;
  return <div>{page}</div>;
}
function WrappedApp() {
  const [workbook, setWorkbook] = useState<WorkBook | null>(null);
  return (
    <GlobalContext.Provider
      value={{
        workbook: workbook,
        updateWorkbook: setWorkbook,
      }}
    >
      <App />
    </GlobalContext.Provider>
  );
}
export default WrappedApp;
