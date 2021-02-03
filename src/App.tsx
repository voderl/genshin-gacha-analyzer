/** @jsxImportSource @emotion/react */
import { useContext, useState } from 'react';
import GlobalContext from './context/GlobalContext';
import { LoadPage } from './pages/LoadPage';
import { ShowPage } from './pages/ShowPage';

import './App.css';
import { WorkBook } from 'xlsx/types';

function App() {
  const { workbook } = useContext(GlobalContext);
  return workbook === null ? <LoadPage /> : <ShowPage />;
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
