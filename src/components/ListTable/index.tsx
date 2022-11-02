/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, isValidElement, memo, ReactNode, useCallback, useMemo, useState } from 'react';
import { List, ListProps } from 'antd';
import CaretDownOutlined from '@ant-design/icons/CaretDownOutlined';
import CaretUpOutlined from '@ant-design/icons/CaretUpOutlined';
import VirtualList, { IVirtualListProps } from 'components/VirtualList';
import _ from 'lodash';
import cls from 'classnames';

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
  sorter?: (item: T) => any;
  sorterList?: ('asc' | 'desc' | '')[];
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

type TSorterProps = {
  value: 'asc' | 'desc' | '';
  list?: TSorterProps['value'][];
  onChange: (sorter: TSorterProps['value']) => void;
};

const defaultSorterList = ['', 'asc', 'desc'] as const;

const sorterHeaderStyle = css`
  cursor: pointer;
  display: inline-flex;
  white-space: nowrap;

  padding: 4px 12px;
  margin-left: -12px;

  .ant-table-column-sorter-inner {
    margin-left: 8px;
    color: #bfbfbf;
    transition: color 0.3s;
  }

  .sorter-icon {
    font-size: 12px;
  }
`;

const SorterComponent: FC<TSorterProps> = ({
  value,
  list = defaultSorterList,
  onChange,
  children,
}) => {
  return (
    <span
      css={sorterHeaderStyle}
      onClick={() => {
        const idx = list.indexOf(value);
        if (idx === -1) onChange(list[0]);
        else if (idx + 1 >= list.length) onChange(list[0]);
        else onChange(list[idx + 1]);
      }}
    >
      {children}
      <span className='ant-table-column-sorter-inner'>
        <CaretUpOutlined
          className={cls(`ant-table-column-sorter-up sorter-icon`, {
            active: value === 'asc',
          })}
          role='presentation'
        />
        <CaretDownOutlined
          className={cls(`ant-table-column-sorter-down sorter-icon`, {
            active: value === 'desc',
          })}
          role='presentation'
        />
      </span>
    </span>
  );
};

type TTableSorter = {
  direction: TSorterProps['value'];
  dataIndex: string;
};

const ListTableHeader: FC<{
  columns: TListTableColumns;
  sorter: TTableSorter;
  onSorterChange: (v: TTableSorter) => void;
}> = memo(({ columns, sorter, onSorterChange }) => {
  return (
    <div className='list-table-row list-table-header'>
      {columns.map((column) => {
        const direction = column.dataIndex === sorter.dataIndex ? sorter.direction : '';
        const title = typeof column.title === 'function' ? column.title() : column.title;
        return (
          <ListTableRowItem key={column.dataIndex} column={column}>
            {column.sorter ? (
              <SorterComponent
                value={direction}
                list={column.sorterList}
                onChange={(v) => {
                  onSorterChange({
                    direction: v,
                    dataIndex: column.dataIndex,
                  });
                }}
              >
                {title}
              </SorterComponent>
            ) : (
              title
            )}
          </ListTableRowItem>
        );
      })}
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
    padding-top: 8px;
    padding-bottom: 8px;
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

  const [sorterStatus, setSorterStatus] = useState<TTableSorter>({
    direction: '',
    dataIndex: '',
  });

  const sortedData = useMemo(() => {
    if (!sorterStatus.direction) return dataSource;
    const currentColumn = columns.find((item) => item.dataIndex === sorterStatus.dataIndex);
    if (!currentColumn || !currentColumn.sorter) return dataSource;

    return _.orderBy(dataSource, currentColumn.sorter, sorterStatus.direction);
  }, [columns, dataSource, sorterStatus]);

  const headerContent = (
    <ListTableHeader columns={columns} sorter={sorterStatus} onSorterChange={setSorterStatus} />
  );
  return (
    <List
      header={typeof header === 'function' ? header(headerContent) : headerContent}
      className={className}
      css={listTableCss}
      {...props}
    >
      <VirtualList
        isVirtual={virtualProps.isVirtual}
        listRef={virtualProps.listRef}
        itemHeight={virtualProps.itemHeight}
        getContainer={virtualProps.getContainer}
        dataSource={sortedData}
        renderItem={wrappedRenderItem}
      />
    </List>
  );
};

export default ListTable;
