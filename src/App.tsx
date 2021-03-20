/** @jsxImportSource @emotion/react */
import { GlobalContextProvider, useGlobalContext } from './context/GlobalContext';
import { LoadPage } from './pages/LoadPage';
import { ShowPage } from './pages/ShowPage';

import './App.css';

function App() {
  const { workbook } = useGlobalContext();
  return workbook === null ? <LoadPage /> : <ShowPage />;
}
function WrappedApp() {
  return (
    <GlobalContextProvider>
      <App />
    </GlobalContextProvider>
  );
}
export default WrappedApp;
