/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useContext, useState } from 'react';
import { Button, Upload, Alert, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import XLSX from 'xlsx';
import GlobalContext from 'context/GlobalContext';

const { Dragger } = Upload;
type LoadPageProps = {
  onLoad?: () => void;
};

export const LoadPage: FC<LoadPageProps> = function ({ onLoad }) {
  const [loading, setLoading] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<String | null>(null);
  const { updateWorkbook } = useContext(GlobalContext);
  const handleUpload = useCallback((file: RcFile) => {
    if (!file.name.endsWith('.xlsx')) {
      setErrorMessage('文件类型错误，请重新上传');
      return false;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      const data = new Uint8Array((e.target as FileReader).result as any);
      const workbook = XLSX.read(data, { type: 'array' });
      updateWorkbook(workbook);
    };
    reader.onerror = function (e: ProgressEvent<FileReader>) {
      setErrorMessage('解析文件失败');
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
    return false;
  }, []);
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
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
        <a href='https://ngabbs.com/read.php?tid=25004616' target='_blank'>
          <Alert
            message={
              <div>
                不知道如何获取文件？
                <Button type='link'>请点击这里</Button>
              </div>
            }
            type='info'
            showIcon
            banner
          />
        </a>
      </div>
      <Dragger
        name='file'
        accept='.xlsx'
        multiple={false}
        beforeUpload={handleUpload}
        showUploadList={false}
        css={css`
          min-width: 600px;
          padding: 40px;
        `}
      >
        {errorMessage && <Alert message={errorMessage} type='error' />}
        <p className='ant-upload-drag-icon'>
          {loading ? <Spin tip='上传中...' /> : <InboxOutlined />}
        </p>
        <p className='ant-upload-text'>点击选择或者拖动文件来上传</p>
      </Dragger>
      <Alert
        css={css`
          margin: 20px 0;
          width: 600px;
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
    </div>
  );
};
