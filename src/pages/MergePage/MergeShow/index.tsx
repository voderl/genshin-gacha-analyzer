/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { Button, message, Tooltip } from 'antd';
import { ExcelParsedObject } from 'utils/parseExcel';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import { UploadItem, UploadItemProps } from '../UploadItem';
import mergeData from './mergeData';
import downloadExcel from './downloadExcel';
import { useGlobalContext } from 'context/GlobalContext';
import { compressToHash } from 'utils/compress';

type MergeShowProps = {
  values: ExcelParsedObject[];
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
    } catch (e) {
      info.type = 'error';
      info.message = e.message;
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
        setDownloading(false);
      },
    );
  }, [successData]);
  const handleGoToAnalyzer = useCallback(() => {
    if (!successData) return;
    updateParsedData(successData.data);
    compressToHash(successData.data);
    updatePage('');
  }, [successData]);
  if (values.length === 0) return <></>;
  return (
    <>
      <Tooltip title={values.length <= 1 ? '请导入至少两个Excel文件' : ''} placement='bottom'>
        <Button icon={<UploadOutlined />} onClick={handleMerge} disabled={values.length <= 1}>
          合并生成新文件
        </Button>
      </Tooltip>
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
