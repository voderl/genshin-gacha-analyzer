/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useMemo, useState } from 'react';
import { Button, Upload, Alert } from 'antd';
import { RcFile } from 'antd/lib/upload';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import { FriendLinks } from 'components/FriendLinks';
import { parseExcel, parseJson } from 'parser';
import { UploadItem, UploadItemProps } from './UploadItem';
import MergeShow from './MergeShow';

type MergePageProps = {};

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
    const isXlsx = file.name.endsWith('.xlsx');
    const isJson = file.name.endsWith('.json');

    const getErrorMessage = (e: any) => {
      if (typeof e === 'string') return e;
      if (typeof e === 'object' && 'message' in e) return e.message;
      return '未知错误';
    };

    if (!isXlsx && !isJson) {
      data.message = '文件类型错误，请上传 xlsx 文件或 json 文件';
      addToList(data);
    } else {
      if (isXlsx) {
        file
          .arrayBuffer()
          .then((arrayBuffer) => {
            return parseExcel(arrayBuffer);
          })
          .then((values) => {
            data.data = values;
            data.type = 'success';
            addToList(data);
          })
          .catch((e) => {
            data.message = getErrorMessage(e);
            addToList(data);
          });
      } else if (isJson) {
        file
          .text()
          .then((str) => {
            const json = JSON.parse(str);
            const parsedData = parseJson(json);
            data.data = parsedData;
            data.type = 'success';
            addToList(data);
          })
          .catch((e) => {
            data.message = getErrorMessage(e);
            addToList(data);
          });
      }
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
          accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xlsx, .json'
          multiple={true}
          beforeUpload={handleBeforeUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} type='primary'>
            导入 xlsx 文件或 json 文件
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
