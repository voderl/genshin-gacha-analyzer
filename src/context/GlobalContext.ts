import React from 'react';
import { WorkBook } from 'xlsx/types';

type GlobalContextType = {
  workbook: WorkBook | null;
  updateWorkbook: (workbook: WorkBook) => void;
};

const GlobalContext = React.createContext<GlobalContextType>({
  workbook: null,
  updateWorkbook: (() => {}) as any,
});

export default GlobalContext;
