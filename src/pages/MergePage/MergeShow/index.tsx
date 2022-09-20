/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { Button, message } from 'antd';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import { UploadItem, UploadItemProps } from '../UploadItem';
import mergeData from './mergeData';
import downloadExcel from './downloadExcel';
import { useGlobalContext } from 'context/GlobalContext';
import { compressToHash } from 'utils/compress';
import { TParsedData } from 'types';
import { clearGlobalCache } from 'context/CacheContext';

type MergeShowProps = {
  values: TParsedData[];
};

const ButtonWrapperStyle = css`
  width: 100%;
  display: flex;
  justify-content: space-around;

  padding: 8px 12px;
`;
const MergeShow: FC<MergeShowProps> = function ({ values }) {
  const [successData, setSuccessData] = useState<UploadItemProps>();
  const [downloading, setDownloading] = useState(false);
  const { updateParsedData, updatePage } = useGlobalContext();
  const handleMerge = useCallback(() => {
    const info = {
      title: '合成后的抽卡记录',
      type: 'success',
      message: '',
      closable: false,
    } as UploadItemProps;
    try {
      info.data = mergeData(values);
    } catch (e: any) {
      info.type = 'error';
      console.error(e);
      if (typeof e === 'string') info.message = e;
      else if (typeof e === 'object' && 'message' in e) info.message = e.message;
      else info.message = 'unknown error';
    }
    setSuccessData(info);
  }, [values]);
  const hanldeDownload = useCallback(() => {
    if (!successData) return;
    setDownloading(true);
    downloadExcel(successData.data).then(
      () => setDownloading(false),
      (e) => {
        message.error(e.message);
        console.error(e);
        setDownloading(false);
      },
    );
  }, [successData]);
  const handleGoToAnalyzer = useCallback(() => {
    if (!successData) return;
    clearGlobalCache();
    updateParsedData(successData.data);
    compressToHash(successData.data);
    updatePage('show');
  }, [successData]);
  if (values.length === 0) return <></>;
  return (
    <>
      <Button icon={<UploadOutlined />} onClick={handleMerge} disabled={false}>
        合并生成新文件
      </Button>
      {successData && (
        <>
          <UploadItem {...successData} />
          <div css={ButtonWrapperStyle}>
            <Button
              onClick={hanldeDownload}
              type='primary'
              loading={downloading}
              icon={<DownloadOutlined />}
            >
              导出Excel
            </Button>
            <Button onClick={handleGoToAnalyzer} type='default' icon={<PieChartOutlined />}>
              前往分析页
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default MergeShow;
