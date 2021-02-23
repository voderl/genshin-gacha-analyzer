/** @jsxImportSource @emotion/react */
import React, { FC, useEffect, useRef } from 'react';
// @ts-ignore
import canvasDataGrid from 'canvas-datagrid';

type CanvasDataGridProps = {
  onCreate?: (grid: any) => void; // 获取最初的参数
  attributes?: {
    [key: string]: any;
  };
  data: Array<any> | undefined;
  schema?: Array<any>;
};
export const CanvasDataGrid: FC<
  CanvasDataGridProps & React.HTMLAttributes<HTMLDivElement>
> = function ({ data, schema, attributes, onCreate, ...props }) {
  const divEl = useRef(null);
  const gridRef = useRef(null);
  // TODO: ADD go_to_top_button and bottom button
  useEffect(() => {
    if (gridRef.current) {
      (gridRef.current as any).schema = schema;
    }
  }, [schema]);
  useEffect(() => {
    if (gridRef.current) {
      (gridRef.current as any).data = data;
    }
  }, [data]);
  useEffect(() => {
    let grid: any;
    const timer = setTimeout(() => {
      grid = canvasDataGrid({
        parentNode: divEl.current,
        schema: schema,
        ...attributes,
      });
      grid.style.scrollBarBoxWidth = 10;
      grid.style.scrollBarWidth = 13;
      onCreate && onCreate(grid);
      gridRef.current = grid;
      setTimeout(() => {
        if (gridRef.current) (gridRef.current as any).data = data;
      });
    });
    return () => {
      clearTimeout(timer);
      if (gridRef.current) (gridRef.current as any).dispose();
    };
  }, []);
  return <div ref={divEl} {...props}></div>;
};
