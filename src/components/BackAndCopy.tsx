/**
 * 更新数据与复制链接按钮
 */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { Button, message } from 'antd';
import RollbackOutlined from '@ant-design/icons/RollbackOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import { useGlobalContext } from 'context/GlobalContext';
import copy from 'copy-to-clipboard';

type BackAndCopyProps = {};

enum ECopyStatus {
  Success,
  Fail,
  Pending,
}

const wrapperStyle = css`
  text-align: center;
`;

const buttonStyle = css`
  margin: 0 16px;
`;

const successStyle = css`
  color: #52c41a;
  border-color: rgba(82, 196, 26, 0.4);
  &:hover {
    color: #73d13d;
    border-color: rgba(82, 196, 26, 0.6);
  }
  &:focus {
    color: #73d13d;
    border-color: rgba(82, 196, 26, 0.3);
  }
  &:active {
    color: #389e0d;
    border-color: rgba(82, 196, 26, 0.8);
  }
`;

const copyTextMap = {
  [ECopyStatus.Pending]: '复制链接',
  [ECopyStatus.Success]: '复制成功',
  [ECopyStatus.Fail]: '复制失败',
};
const copyIconMap = {
  [ECopyStatus.Pending]: <CopyOutlined />,
  [ECopyStatus.Success]: <CheckOutlined css={successStyle} />,
  [ECopyStatus.Fail]: <CloseOutlined />,
};

export const BackAndCopy: FC<BackAndCopyProps> = function () {
  const { updateParsedData, isVertical } = useGlobalContext();
  const [copyStatus, updateCopyStatus] = useState(ECopyStatus.Pending);
  const handleBackToLoadPage = useCallback(() => {
    updateParsedData(null as any);
  }, []);
  const handleCopy = useCallback(() => {
    try {
      copy(window.location.href);
      updateCopyStatus(ECopyStatus.Success);
    } catch (e) {
      message.error('复制失败，请手动复制');
      updateCopyStatus(ECopyStatus.Fail);
    }
  }, []);
  if (!window.location.hash) return <></>;
  return (
    <div
      css={wrapperStyle}
      style={{
        margin: isVertical ? '16px auto 8px' : '24px auto 16px',
      }}
    >
      <Button css={buttonStyle} onClick={handleBackToLoadPage} icon={<RollbackOutlined />}>
        更新数据
      </Button>
      <Button
        danger={copyStatus === ECopyStatus.Fail}
        css={[buttonStyle, ...(copyStatus === ECopyStatus.Success ? [successStyle] : [])]}
        onClick={handleCopy}
        icon={copyIconMap[copyStatus]}
      >
        {copyTextMap[copyStatus]}
      </Button>
    </div>
  );
};
