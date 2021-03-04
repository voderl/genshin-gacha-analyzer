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
// 给予canvas-datagrid一个缩放，令x轴方向不出现滚动条
function scaleToWidth(grid: any) {
  if (!grid.self) return;
  if (grid.style.width === 'auto') return;
  const sbw = grid.style.scrollBarWidth * 2 * grid.style.scrollBarBorderWidth * 2;
  const { scrollBox } = grid.self;
  let dataWidth = scrollBox.width / scrollBox.widthBoxRatio;
  if (scrollBox.verticalBarVisible) dataWidth -= sbw;
  const showWidth = scrollBox.bar.v.x;
  grid.self.scale *= showWidth / (dataWidth + scrollBox.left);
}
export const CanvasDataGrid: FC<
  CanvasDataGridProps & React.HTMLAttributes<HTMLDivElement>
> = function ({ data, schema, attributes, onCreate, ...props }) {
  const divEl = useRef(null);
  const gridRef = useRef(null);
  useEffect(() => {
    if (gridRef.current) {
      const grid: any = gridRef.current;
      grid.schema = schema;
      scaleToWidth(grid);
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
      scaleToWidth(grid);
      gridRef.current = grid;
      setTimeout(() => {
        if (gridRef.current) (gridRef.current as any).data = data;
      });
    });
    return () => {
      clearTimeout(timer);
      if (gridRef.current) {
        (gridRef.current as any).dispose();
        delete (gridRef.current as any).self;
      }
    };
  }, []);
  return <div ref={divEl} {...props}></div>;
};
