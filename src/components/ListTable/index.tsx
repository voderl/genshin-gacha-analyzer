/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, isValidElement, memo, ReactNode, useCallback } from 'react';
import { List, ListProps } from 'antd';
import VirtualList, { IVirtualListProps } from 'components/VirtualList';

export interface IListTableProps<T> extends Omit<ListProps<T>, 'renderItem'> {
  columns: TListTableColumns<T>;
  header?: (content: ReactNode) => ReactNode;
  dataSource: T[];
  renderItem?: (content: ReactNode, item: T, index: number) => ReactNode;
  itemKey?: string | ((item: T, index: number) => string);
  virtualProps: Omit<IVirtualListProps, 'renderItem' | 'dataSource'>;
}

export type TListTableColumns<T = any> = Array<{
  title: string | (() => ReactNode);
  dataIndex: string;
  width: number;
  maxWidth?: number;
  minWidth?: number;
  render?: (value: any, item: T, index: number) => ReactNode;
}>;

const ListTableRowItem: FC<{
  column: TListTableColumns[number];
}> = memo(({ column, children }) => {
  const { width, minWidth, maxWidth } = column;
  return (
    <div
      style={{
        width,
        flexShrink: width,
        flexGrow: width,
        minWidth,
        maxWidth,
      }}
    >
      {children}
    </div>
  );
});

const ListTableRowItemRender: FC<{
  column: TListTableColumns[number];
  item: any;
  index: number;
}> = memo(({ column, item, index }) => {
  const { dataIndex, render } = column;
  return typeof render === 'function' ? render(item[dataIndex], item, index) : item[dataIndex];
});

const ListTableHeader: FC<{
  columns: TListTableColumns;
}> = memo(({ columns }) => {
  return (
    <div className='list-table-row list-table-header'>
      {columns.map((column) => (
        <ListTableRowItem key={column.dataIndex} column={column}>
          {typeof column.title === 'function' ? column.title() : column.title}
        </ListTableRowItem>
      ))}
    </div>
  );
});

const ListTableRow: FC<{
  columns: TListTableColumns;
  item: any;
  index: number;
}> = memo(({ columns, item, index }) => {
  return (
    <div className='list-table-row'>
      {columns.map((column) => (
        <ListTableRowItem key={column.dataIndex} column={column}>
          <ListTableRowItemRender column={column} item={item} index={index} />
        </ListTableRowItem>
      ))}
    </div>
  );
});

const listTableCss = css`
  border-top: none;
  border-bottom: none;

  .list-table-row {
    display: flex;
    width: 100%;
    align-items: center;
  }

  .list-table-row .list-table-row-item {
    display: flex;
    align-items: center;
  }

  .ant-list-item {
    padding: 0;
  }

  .ant-list-header {
    border-bottom: 1px solid rgb(229, 230, 235);
  }

  .ant-list-item:last-child {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const ListTable: <T = any>(props: IListTableProps<T>) => JSX.Element = function ({
  className,
  header,
  dataSource,
  columns,
  renderItem,
  itemKey,
  virtualProps,
  ...props
}) {
  const wrappedRenderItem = useCallback(
    (item, index) => {
      const baseContent = <ListTableRow columns={columns} item={item} index={index} />;
      const content =
        typeof renderItem === 'function' ? renderItem(baseContent, item, index) : baseContent;
      let key: string | number | null = index;
      if (typeof itemKey === 'string') {
        if (typeof item === 'object') key = (item as any)[itemKey];
      } else if (typeof itemKey === 'function') key = itemKey(item, index);
      else if (isValidElement(content)) key = content.key;

      return (
        <List.Item
          key={key}
          style={{
            height: virtualProps.itemHeight,
          }}
        >
          {content}
        </List.Item>
      );
    },
    [columns, itemKey, virtualProps.itemHeight],
  );

  return (
    <List
      header={
        typeof header === 'function' ? (
          header(<ListTableHeader columns={columns} />)
        ) : (
          <ListTableHeader columns={columns} />
        )
      }
      className={className}
      css={listTableCss}
      {...props}
    >
      <VirtualList
        isVirtual={virtualProps.isVirtual}
        listRef={virtualProps.listRef}
        itemHeight={virtualProps.itemHeight}
        getContainer={virtualProps.getContainer}
        dataSource={dataSource}
        renderItem={wrappedRenderItem}
      />
    </List>
  );
};

export default ListTable;
