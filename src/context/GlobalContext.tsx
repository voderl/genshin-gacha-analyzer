import React, { useEffect, useMemo, useRef, useState, FC, useContext } from 'react';
import { TParsedData } from 'types';

type GlobalContextType = {
  page: string;
  parsedData: TParsedData;
  isVertical: boolean;
  updatePage: (page: string) => void;
  updateParsedData: (parsedData: TParsedData) => void;
};

export const GlobalContext = React.createContext<GlobalContextType>({
  parsedData: undefined as any,
  page: '',
  isVertical: false,
  updateParsedData: (() => {}) as any,
  updatePage: (() => {}) as any,
});

// 获取尺寸信息
function getInfo() {
  const clientWidth = document.body.clientWidth;
  const clientHeight = document.body.clientHeight;
  return {
    clientWidth,
    clientHeight,
    isVertical: clientHeight > clientWidth,
  };
}

export const useGlobalContext = function () {
  return useContext(GlobalContext);
};

export const GlobalContextProvider: FC<{}> = function ({ children }) {
  const [parsedData, updateParsedData] = useState<TParsedData>();
  const [page, updatePage] = useState<string>('');
  const initInfo = useMemo(() => getInfo(), []);
  const [isVertical, setVertical] = useState(initInfo.isVertical);
  const isVerticalRef = useRef<boolean>(isVertical);
  useEffect(() => {
    isVerticalRef.current = isVertical;
  }, [isVertical]);
  useEffect(() => {
    function resize() {
      const { isVertical: nowIsVertical } = getInfo();
      if (nowIsVertical !== isVerticalRef.current) setVertical(nowIsVertical);
    }
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);
  const value = useMemo(() => {
    return {
      parsedData: parsedData!,
      updateParsedData,
      page,
      updatePage,
      isVertical,
    };
  }, [isVertical, parsedData, page]);
  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};
