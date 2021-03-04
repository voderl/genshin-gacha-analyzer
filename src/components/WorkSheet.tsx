/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { COLOR, FONT_FAMILY, ISMOBILE } from 'const';
import React, { FC, useCallback } from 'react';
import { CanvasDataGrid } from './CanvasDataGrid';

type WorkSheetProps = {
  data: Array<any>;
  schema: SchemaType;
  onCreate?: (grid: any) => void;
};

type SchemaType = Array<{
  name?: string;
  type?: string;
  title?: string;
  width?: number;
  hidden?: boolean;
  filter?: (e: any) => boolean;
  formatter?: (e: any) => any;
  defaultValue?: any;
}>;

const attributes = {
  editable: false,
  allowColumnResize: false,
  allowRowResize: false,
  orderBy: '时间',
  touchZoomMin: 0.5,
  touchZoomMax: 1.5,
};
export const WorkSheet: FC<WorkSheetProps> = function ({ data, schema, onCreate }) {
  const handleCreate = useCallback((node: any) => {
    if (process.env.NODE_ENV === 'development') (window as any).node = node;
    const oldStringSorter = node.sorters.string;
    // sortBy 时间
    node.sorters.string = function (columnName: string, direction: string) {
      if (columnName === '时间') {
        const sortTime = oldStringSorter(columnName, direction);
        const sortCount = node.sorters.number('总次数', direction);
        return (l: any, r: any) => {
          const info = sortTime(l, r);
          return info === 0 ? sortCount(l, r) : info;
        };
      } else return oldStringSorter(columnName, direction);
    };
    // render color:
    node.addEventListener('rendertext', function (e: any) {
      const star = e.row['星级'];
      if (star === 4) {
        e.ctx.fillStyle = COLOR.FOUR_STAR;
      } else if (star === 5) {
        e.ctx.fillStyle = COLOR.FIVE_STAR;
      }
    });
    node.style.height = '100%';
    if (ISMOBILE) node.style.width = '100%';
    node.canvas.style.margin = '0 auto';
    node.style.cellHorizontalAlignment = 'center';
    node.style.activeCellHorizontalAlignment = 'center';
    node.style.columnHeaderCellHorizontalAlignment = 'center';
    const font = '16px ' + FONT_FAMILY;
    node.style.cellFont = font;
    node.style.activeCellFont = font;
    node.style.columnHeaderCellFont = font;
    node.style.rowHeaderCellFont = font;
    node.style.cellColor = '#262626';
    node.style.activeCellColor = '#262626';
    onCreate && onCreate(node);
  }, []);
  return (
    <CanvasDataGrid
      css={css`
        width: 100%;
        height: 100%;
        position: relative;
        overflow-y: hidden;
        overflow-x: auto;
        border-bottom: 2px dotted thistle;
      `}
      onCreate={handleCreate}
      data={data}
      schema={schema}
      attributes={attributes}
    />
  );
};
