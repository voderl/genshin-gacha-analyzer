/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { Button, Upload, Alert, Spin, message, AlertProps, Tooltip } from 'antd';
import InboxOutlined from '@ant-design/icons/InboxOutlined';
import { RcFile, UploadProps } from 'antd/lib/upload';
import { useGlobalContext } from 'context/GlobalContext';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import XLSXNameSpace from 'xlsx/types';
import { FriendLinks } from 'components/FriendLinks';
import parseExcel, { ExcelParsedObject } from 'utils/parseExcel';
import { DataItem } from 'types';
import { UploadItem, UploadItemProps } from './UploadItem';
import mergeData from './MergeShow/mergeData';
import downloadExcel from './MergeShow/downloadExcel';
import MergeShow from './MergeShow';

type MergePageProps = {};
// 预加载
// @ts-ignore
import('xlsx/dist/xlsx.mini.min.js');

function parseFile(file: RcFile): Promise<ExcelParsedObject> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      // @ts-ignore
      import('xlsx/dist/xlsx.mini.min.js')
        .then((module) => {
          try {
            const XLSX: typeof XLSXNameSpace = module;
            const data = new Uint8Array((e.target as FileReader).result as any);
            const workbook = XLSX.read(data, { type: 'array' });
            resolve(parseExcel(XLSX, workbook));
          } catch (e) {
            console.error(e);
            reject(e.message);
          }
        })
        .catch((e) => {
          console.log(e);
          reject('XLSX解析文件加载失败，请重新上传');
        });
    };
    reader.onerror = function (e: ProgressEvent<FileReader>) {
      reject('读取文件失败，请重新上传');
    };
    reader.readAsArrayBuffer(file);
  });
}

const WrapperStyle = css`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 8px 0 0;
  text-align: center;
`;
export const MergePage: FC<MergePageProps> = function ({}) {
  const [dataList, setDataList] = useState<UploadItemProps[]>([]);

  const valuesList = useMemo(() => {
    return dataList.filter((o) => o.data).map((o) => o.data);
  }, [dataList]);

  const handleBeforeUpload = useCallback((file: RcFile, fileList: any) => {
    const data = {
      file,
      message: '',
      type: 'error',
    } as UploadItemProps;
    const addToList = (item: any) => {
      setDataList((v) => v.concat(item));
    };
    if (!file.name.endsWith('.xlsx')) {
      data.message = '文件类型错误，请上传xlsx文件';
      addToList(data);
    } else {
      parseFile(file)
        .then((values) => {
          data.data = values;
          data.type = 'success';
          addToList(data);
        })
        .catch((e) => {
          data.message = e;
          addToList(data);
        });
    }
    return false;
  }, []);

  const handleCloseItem = useCallback(
    (file: RcFile) => {
      const index = dataList.findIndex((v) => v.file === file);
      if (index === -1) return;
      const _dataList = [...dataList];
      _dataList.splice(index, 1);
      setDataList(_dataList);
    },
    [dataList],
  );
  return (
    <div
      css={css`
        overflow: auto;
      `}
    >
      <div
        className='ant-alert-info'
        css={css`
          width: 100%;
          display: flex;
          justify-content: center;
          border: none;
          margin: 20px 0;
        `}
      >
        <Alert
          message={'部分手机浏览器可能不支持导出Excel文件'}
          type='info'
          showIcon={false}
          banner
        />
      </div>
      <div css={WrapperStyle}>
        <Upload
          name='file'
          accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xlsx'
          multiple={true}
          beforeUpload={handleBeforeUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} type='primary'>
            导入Excel文件
          </Button>
        </Upload>
        {dataList.map((item) => (
          <UploadItem
            {...item}
            key={item.file!.uid}
            onClose={handleCloseItem}
            title={item.file!.name}
          />
        ))}
        <MergeShow values={valuesList} />
        <Alert
          css={css`
            margin: 20px auto;
          `}
          message={
            <div>
              此网站是静态网站，你的文件不会被上传到网站后台，具体代码请查看
              <Button
                type='link'
                href='https://github.com/voderl/genshin-gacha-analyzer'
                target='_blank'
              >
                github链接
              </Button>
            </div>
          }
          type='warning'
          showIcon
        />
        <FriendLinks mode='bottom' visible />
      </div>
    </div>
  );
};
