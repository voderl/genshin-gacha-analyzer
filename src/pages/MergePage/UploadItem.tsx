/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { Alert, AlertProps } from 'antd';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import { RcFile } from 'antd/lib/upload';
import { ExcelParsedObject } from 'utils/parseExcel';

export type UploadItemProps = {
  title: string;
  message: ReactNode;
  type: AlertProps['type'];
  data: ExcelParsedObject;
  file?: RcFile;
  onClose?: (file: RcFile) => void;
  closable?: boolean;
};

const WrapperStyle = css`
  text-align: left;
  margin: 8px 24px;
  .ant-alert-close-text {
    font-size: 16px;
  }
`;
export const UploadItem: FC<UploadItemProps> = function ({
  message,
  type,
  file,
  onClose,
  data,
  title,
  closable = true,
}) {
  const handleClose = useCallback(() => {
    if (!file) return;
    onClose && onClose(file);
  }, [file, onClose]);
  const description = useMemo(() => {
    if (!data) return message;
    const { from, to, count } = Object.values(data).reduce(
      (acc, cur) => {
        acc.count += cur.length;
        if (cur.length === 0) return acc;
        const start = cur[0];
        const end = cur[cur.length - 1];
        if (!acc.from) acc.from = start.date;
        else acc.from = Math.min(acc.from, start.date);
        if (!acc.to) acc.to = end.date;
        else acc.to = Math.max(acc.to, end.date);
        return acc;
      },
      {
        from: 0,
        to: 0,
        count: 0,
      },
    );
    const format = (date: number) => {
      if (!date) return '未知时间范围';
      return new Date(date).toLocaleDateString();
    };
    return `时间范围: ${format(from)} —— ${format(to)}(共 ${count} 抽)`;
  }, [message, data]);
  return (
    <Alert
      css={WrapperStyle}
      type={type}
      closeText={closable === true ? <DeleteOutlined /> : void 0}
      message={title}
      description={description}
      afterClose={handleClose}
      closable={closable}
      showIcon
    />
  );
};
