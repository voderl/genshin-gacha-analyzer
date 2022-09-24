import React, {
  MutableRefObject,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface IVirtualListProps<T = any> {
  isVirtual?: boolean;
  listRef?: MutableRefObject<{
    scrollTo: typeof window['scrollTo'];
  }>;
  itemHeight: number;
  dataSource: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getContainer: () => HTMLElement | typeof window;
  overscan?: number;
}

function useMemorizedFn<T extends (this: any, ...args: any[]) => any>(fn: T) {
  const fnRef = useRef<T>();
  fnRef.current = fn;
  const memorizedFn = useRef<T>();
  if (!memorizedFn.current) {
    memorizedFn.current = function (...args) {
      return fnRef.current!.apply(this, args);
    } as T;
  }
  return memorizedFn.current;
}

const VirtualList: <T = any>(props: IVirtualListProps<T>) => JSX.Element = function ({
  isVirtual = true,
  listRef,
  itemHeight,
  dataSource,
  renderItem,
  getContainer,
  overscan = 3,
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<number[]>([]);
  const calculateRange = useMemorizedFn(() => {
    if (!isVirtual) return;
    const wrapperEl = wrapperRef.current;
    const container = getContainer();
    if (wrapperEl) {
      const wrapperRect = wrapperEl.getBoundingClientRect();
      const containerRect =
        container && 'getBoundingClientRect' in container
          ? container.getBoundingClientRect()
          : {
              top: 0,
              bottom: window.innerHeight,
            };
      const startHeight = Math.max(0, containerRect.top - wrapperRect.top);
      const endHeight = Math.max(
        0,
        Math.min(window.innerHeight, containerRect.bottom) - wrapperRect.top,
      );
      const startIndex = Math.floor(startHeight / itemHeight);
      const endIndex = Math.ceil(endHeight / itemHeight);
      if (startIndex !== range[0] || endIndex !== range[1]) {
        setRange([startIndex, endIndex]);
      }
    }
  });

  useEffect(() => {
    const containerEl = getContainer();
    const listener = calculateRange;
    containerEl.addEventListener('scroll', listener);
    return () => containerEl.removeEventListener('scroll', listener);
  }, []);

  useLayoutEffect(() => {
    calculateRange();
  }, [dataSource.length]);

  useImperativeHandle(listRef, () => {
    return {
      scrollTo(...args: any[]) {
        const container = getContainer();
        container.scrollTo(...args);
        calculateRange();
      },
    };
  });

  const actualRange: number[] = useMemo(() => {
    if (!isVirtual) return [0, dataSource.length - 1];
    if (range.length === 0) return [];
    const [startIndex, endIndex] = range;
    return [
      Math.max(0, startIndex - overscan),
      Math.min(dataSource.length - 1, endIndex + overscan),
    ];
  }, [range, dataSource.length, overscan, isVirtual]);

  const renderList = useMemo(() => {
    if (actualRange.length === 0) return [];
    const [startIndex, endIndex] = actualRange;
    return dataSource
      .slice(startIndex, endIndex + 1)
      .map((item, index) => renderItem(item, startIndex + index));
  }, [dataSource, actualRange, renderItem]);

  const paddingTop = actualRange.length === 0 ? 0 : actualRange[0] * itemHeight;
  const totalHeight = dataSource.length * itemHeight;

  return (
    <div
      ref={wrapperRef}
      className='border-box'
      style={{
        height: totalHeight,
        paddingTop: Math.min(totalHeight, paddingTop),
      }}
    >
      {renderList}
    </div>
  );
};

export default VirtualList;
