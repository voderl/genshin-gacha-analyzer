/**
 * 很多数据都是只计算一次，Menu Tab切换 重复挂载消耗性能， 因此使用全局缓存
 * 可以在开发模式下，控制台输入cache查看当前缓存
 */
import React, { useEffect, useMemo, useRef, useState, FC, useContext } from 'react';

type CacheContextType = {
  cache: any;
};

const createCacheContext = function () {
  const GlobalCache = Object.create(null);
  if (process.env.NODE_ENV === 'development') (window as any).cache = GlobalCache;
  const CacheContext = React.createContext<CacheContextType>({
    cache: GlobalCache,
  });
  const useCacheContext = function (key?: string) {
    const { cache } = useContext(CacheContext);
    if (key === undefined) return cache;
    if (key in cache) return cache[key];
    return (cache[key] = Object.create(null));
  };
  const useCacheState = function (state: any, key: string) {
    const { cache } = useContext(CacheContext);
    const [value, setValue] = useState(state);
    if (key in cache)
      return [
        cache[key],
        (v: any) => {
          cache[key] = v;
          setValue(v);
        },
      ];
    return [
      key in cache ? cache[key] : value,
      (v: any) => {
        cache[key] = v;
        setValue(v);
      },
    ];
  };
  const useCacheMemo = function <T>(func: () => T, deps: any[], key: string): T {
    const { cache } = useContext(CacheContext);
    return useMemo(() => {
      if (key in cache) return cache[key];
      return (cache[key] = func());
    }, deps);
  };
  const clearGlobalCache = () => {
    for (let key in GlobalCache) delete GlobalCache[key];
  };
  const CacheContextProvider: FC<{
    path: string;
    initValue?: any;
  }> = function ({ path, initValue, children }) {
    const parentCache = useCacheContext();
    if (!(path in parentCache)) parentCache[path] = initValue || Object.create(null);
    const contextValue = useMemo(() => {
      const cache = parentCache[path];
      return {
        cache,
      };
    }, [path, parentCache]);
    return <CacheContext.Provider value={contextValue}>{children}</CacheContext.Provider>;
  };
  return {
    CacheContextProvider,
    useCacheContext,
    useCacheMemo,
    useCacheState,
    clearGlobalCache,
  };
};
const { CacheContextProvider, useCacheContext, useCacheMemo, useCacheState, clearGlobalCache } =
  createCacheContext();
export {
  CacheContextProvider,
  useCacheContext,
  useCacheMemo,
  createCacheContext,
  useCacheState,
  clearGlobalCache,
};
