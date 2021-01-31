/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Upload, message, Alert, Spin } from 'antd';
import XLSX, { WorkBook, WorkSheet as WorkSheetType } from 'xlsx';

const { Dragger } = Upload;
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

function updateAttribute(node: HTMLDivElement, props: { [key: string]: any }) {
  Object.keys(props).forEach((key) => {
    if (key in node.attributes) node.attributes[key as any] = props[key];
    else (node as any)[key] = props[key] as any;
  });
}
export const WorkSheet: FC<WorkSheetProps> = function ({ data, schema }) {
  const canvasDataGridEl = useRef(null);
  useEffect(() => {
    const node: any = canvasDataGridEl.current;
    if (node !== null) {
      console.log(node, 'reset node');
      (window as any).node = node;
      // fix filter number:
      node.filters.number = function (value: any, filterFor: any) {
        if (!filterFor) {
          return true;
        }
        return value == filterFor;
      };
      const oldStringSorter = node.sorters.string;
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
      updateAttribute(node as any, {
        editable: false,
        allowColumnResize: false,
        schema: schema,
        data: data,
        orderBy: '时间',
      });
    }
  }, []);
  useEffect(() => {
    const node: any = canvasDataGridEl.current;
    if (node !== null) {
      console.log('update');
      if (node.schema !== schema) node.schema = schema;
      node.data = data;
    }
  }, [data]);
  return React.createElement<React.HTMLAttributes<HTMLDivElement>>('canvas-datagrid', {
    ref: canvasDataGridEl,
  } as any);
};
