/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useCallback, useMemo } from 'react';
import { CanvasDataGrid } from './CanvasDataGrid';

type WorkSheetProps = {
  data: Array<any>;
  schema: SchemaType;
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

export const WorkSheet: FC<WorkSheetProps> = function ({ data, schema }) {
  const attributes = useMemo(() => {
    return {
      editable: false,
      allowColumnResize: false,
      allowRowResize: false,
      orderBy: '时间',
    };
  }, []);
  const handleCreate = useCallback((node: any) => {
    (window as any).node = node;
    // fix filter number:
    node.filters.number = function (value: any, filterFor: any) {
      if (!filterFor) {
        return true;
      }
      return value == filterFor;
    };
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
        e.ctx.fillStyle = '#A256E1';
      } else if (star === 5) {
        e.ctx.fillStyle = '#BD6932';
      }
    });
    node.style.height = '100%';
    node.style.margin = '0 auto';
  }, []);
  return (
    <CanvasDataGrid
      css={css`
        width: 100%;
        height: 100%;
        position: relative;
        overflow-y: hidden;
        overflow-x: auto;
        margin-bottom: 20px;
        border-bottom: 2px dotted thistle;
      `}
      onCreate={handleCreate}
      data={data}
      schema={schema}
      attributes={attributes}
    />
  );
};
