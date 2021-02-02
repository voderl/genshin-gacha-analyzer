/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useContext, useState } from 'react';
import GlobalContext from './context/GlobalContext';
import { LoadPage } from './pages/LoadPage';
import { ShowPage } from './pages/ShowPage';
import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import './App.css';
import { WorkBook } from 'xlsx/types';

function App() {
  const { workbook } = useContext(GlobalContext);
  return (
    <Router>
      <Switch>
        <Route path='/load'>
          <LoadPage />
        </Route>
        <Route path='/show'>{workbook === null ? <Redirect to='/load' /> : <ShowPage />}</Route>
        <Route path='/'>
          <Redirect to='/load' />
        </Route>
      </Switch>
    </Router>
  );
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
