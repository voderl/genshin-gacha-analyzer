/**
 * 更新数据与复制链接按钮
 */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { Button, message, Modal, Tooltip } from 'antd';
import RollbackOutlined from '@ant-design/icons/RollbackOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
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

function collectEvent(name: string, data?: any) {
  if ((window as any).gtag) {
    (window as any).gtag('event', name, data);
  }
}

export const BackAndCopy: FC<BackAndCopyProps> = function () {
  const { isVertical, updatePage, parsedData } = useGlobalContext();
  const [copyStatus, updateCopyStatus] = useState(ECopyStatus.Pending);
  const handleBackToLoadPage = useCallback(() => {
    updatePage('');
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

  const handleExport = useCallback(() => {
    Modal.confirm({
      title: '是否导出为 Excel 文件？',
      content: [
        <p>
          在导入源文件仍然存在的情况请直接使用源文件。导出的 Excel
          文件由抽卡记录数据重新生成，可能和导入源文件不同(比如不包含额外信息、角色活动祈愿-2
          合并到角色活动祈愿)。
        </p>,
        <p>部分手机浏览器可能不支持导出。</p>,
      ],
      onOk() {
        return import('pages/MergePage/MergeShow/downloadExcel')
          .then((module) => {
            const downloadExcel = module.default;
            return downloadExcel(parsedData).then(() => {
              message.success('导出成功');
              collectEvent('export_excel');
            });
          })
          .catch((err) => {
            const getErrorMessage = (e: any) => {
              if (typeof e === 'string') return e;
              if (typeof e === 'object' && 'message' in e) return e.message;
              return '未知错误';
            };
            const errorMessage = getErrorMessage(err);
            message.error(`导出失败, ${errorMessage}`);
            collectEvent('export_excel_fail', {
              message: errorMessage,
            });
            console.log(err);
          });
      },
    });
  }, [parsedData]);

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
      <Tooltip title='导出为 Excel 文件'>
        <Button icon={<DownloadOutlined />} onClick={handleExport} />
      </Tooltip>
    </div>
  );
};
