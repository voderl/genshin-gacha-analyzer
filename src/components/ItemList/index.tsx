/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import UpOutlined from '@ant-design/icons/UpOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import { IconButton } from 'components/IconButton';
import ListTable, { TListTableColumns } from 'components/ListTable';
import { COLOR } from 'const';
import { TParsedItem } from 'types';
import { getPoolName } from 'utils';
import { i18n } from 'utils/i18n';
import ItemImage from 'components/ItemImage';

const indexLabelCss = css`
  font-size: 12px;
  position: relative;
  top: -20px;
  opacity: 0.5;
`;

const scrollTopDownCss = css`
  position: absolute;
  left: 100%;
  margin-left: 12px;
  z-index: 999;
  top: -12px;
`;

const nameCss = css`
  margin: 0 8px;
`;

const columns: TListTableColumns<TParsedItem> = [
  {
    title: '',
    dataIndex: 'lineNum',
    width: 40,
    maxWidth: 40,
    minWidth: 0,
    render(value, item, index) {
      return <span css={indexLabelCss}>{index + 1}.</span>;
    },
  },
  {
    title: '时间',
    dataIndex: 'time',
    width: 200,
    minWidth: 150,
  },
  {
    title: '名称',
    dataIndex: 'image',
    width: 48,
    maxWidth: 48,
    minWidth: 48,
    render(value, item) {
      return <ItemImage item={item} />;
    },
  },
  {
    title: '',
    dataIndex: 'name',
    width: 160,
    minWidth: 110,
    render(value) {
      return <div css={nameCss}>{value}</div>;
    },
  },
  {
    title: '类别',
    dataIndex: 'type',
    width: 80,
    render(value, item) {
      return item.type === 'character' ? i18n`角色` : i18n`武器`;
    },
    minWidth: 40,
  },
  {
    title: '星级',
    dataIndex: 'rarity',
    width: 80,
    maxWidth: 120,
    minWidth: 40,
  },
  {
    title: '保底内',
    dataIndex: 'pity',
    width: 80,
    maxWidth: 80,
    minWidth: 50,
  },
];

const shortColumns: TListTableColumns<TParsedItem> = columns.filter((column) =>
  ['lineNum', 'time', 'image', 'name', 'pity'].includes(column.dataIndex),
);

const allColumns = [...columns].concat({
  title: '来源',
  dataIndex: 'poolType',
  width: 100,
  maxWidth: 100,
  minWidth: 100,
  render(value, item) {
    return getPoolName(item.poolType as any);
  },
});

export const useIsClientWidthMoreThan = (boundary: number) => {
  const [isMoreThan, setIsMoreThan] = useState<boolean>(window.innerWidth >= boundary);
  useEffect(() => {
    const listener = () => {
      const newMoreThan = window.innerWidth >= boundary;
      setIsMoreThan(newMoreThan);
    };
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, []);
  return isMoreThan;
};

export interface IItemListProps {
  dataSource: TParsedItem[];
  isShowPoolType?: boolean;
  headerStickyTop?: number;
}
const ItemList: FC<IItemListProps> = function ({
  dataSource,
  isShowPoolType = false,
  headerStickyTop = 0,
}) {
  const isWidthEnough = useIsClientWidthMoreThan(600);

  const listRef = useRef<{
    scrollTo: typeof window['scrollTo'];
  }>();

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: 0,
      });
    }
  }, [dataSource]);

  const handleGoTop = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: 0,
      });
    }
  }, []);
  const handleGoBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: 9999999,
      });
    }
  }, []);

  return (
    <ListTable<TParsedItem>
      css={css`
        margin: auto;
        max-width: 800px;
        margin-bottom: 24px;
        .ant-list-header {
          position: sticky;
          top: ${headerStickyTop}px;
          z-index: 1;
          background: #fcfcfc;
        }
      `}
      header={(content) => (
        <div
          className='bold-text'
          style={{
            position: 'relative',
          }}
        >
          {content}
          <div css={scrollTopDownCss}>
            <IconButton
              placement='right'
              tip='前往顶部'
              icon={<UpOutlined />}
              onClick={handleGoTop}
            />
            <br />
            <IconButton
              placement='right'
              tip='前往底部'
              icon={<DownOutlined />}
              onClick={handleGoBottom}
            />
          </div>
        </div>
      )}
      columns={isWidthEnough ? (isShowPoolType ? allColumns : columns) : shortColumns}
      dataSource={dataSource}
      itemKey='total'
      renderItem={(content, item) => {
        const colorMap: any = {
          4: COLOR.FOUR_STAR,
          5: COLOR.FIVE_STAR,
        };
        return (
          <div
            className={item.rarity in colorMap ? 'bold-text' : ''}
            style={{
              color: colorMap[item.rarity],
              width: '100%',
            }}
          >
            {content}
          </div>
        );
      }}
      virtualProps={{
        overscan: 10,
        itemHeight: 60,
        listRef: listRef as any,
        getContainer: () => document.getElementById('main-container')!,
      }}
    />
  );
};

export default ItemList;
