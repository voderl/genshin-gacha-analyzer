/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { Button, Upload, Alert, Spin } from 'antd';
import InboxOutlined from '@ant-design/icons/InboxOutlined';
import { RcFile } from 'antd/lib/upload';
import { useGlobalContext } from 'context/GlobalContext';
import { FriendLinks } from 'components/FriendLinks';
import { parseExcel, parseJson } from 'parser/index';
import { compressToHash } from 'utils/compress';
import { i18n } from 'utils/i18n';
import { clearGlobalCache } from 'context/CacheContext';

const { Dragger } = Upload;
type LoadPageProps = {
  onLoad?: () => void;
};

export const LoadPage: FC<LoadPageProps> = function ({ onLoad }) {
  const [loading, setLoading] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<String | null>(null);
  const { updateParsedData, updatePage } = useGlobalContext();
  const handleUpload = useCallback((file: RcFile) => {
    const isXlsx = file.name.endsWith('.xlsx');
    const isJson = file.name.endsWith('.json');
    if (!isXlsx && !isJson) {
      setErrorMessage('文件类型错误，请上传 xlsx 文件或 json 文件');
      return false;
    }

    const handleError = (error: any) => {
      setLoading(false);
      if (typeof error === 'string') return setErrorMessage(error);
      if (typeof error === 'object' && 'message' in error) {
        return setErrorMessage(error.message);
      }
    };

    setLoading(true);

    if (isJson) {
      file
        .text()
        .then((str) => {
          const data = JSON.parse(str);
          const parsedData = parseJson(data);
          clearGlobalCache();
          updateParsedData(parsedData);
          compressToHash(parsedData);
          updatePage('show');
        })
        .catch(handleError);
    } else if (isXlsx) {
      file
        .arrayBuffer()
        .then((arrayBuffer) => {
          parseExcel(arrayBuffer)
            .then((parsedData) => {
              clearGlobalCache();
              updateParsedData(parsedData);
              compressToHash(parsedData);
              updatePage('show');
            })
            .catch(handleError);
        })
        .catch(handleError);
    }

    return false;
  }, []);
  const handleGoToMergePage = useCallback(() => {
    updatePage('merge');
  }, []);
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
          message={
            <>
              <div>
                不知道如何获取抽卡记录导出文件？
                <a href='https://voderl.cn/js/genshin/' target='_blank'>
                  <Button type='link'>请点击这里</Button>
                </a>
              </div>
              <div>
                合并多个抽卡记录文件
                <Button type='link' onClick={handleGoToMergePage}>
                  请点击这里
                </Button>
              </div>
            </>
          }
          type='info'
          showIcon={false}
          banner
        />
      </div>
      <Dragger
        name='file'
        accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xlsx, .json'
        multiple={false}
        beforeUpload={handleUpload}
        showUploadList={false}
        css={css`
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px;
        `}
      >
        {errorMessage && <Alert message={errorMessage} type='error' />}
        <p className='ant-upload-drag-icon'>
          {loading ? <Spin tip={i18n`数据正在解析中...`} /> : <InboxOutlined />}
        </p>
        <p className='ant-upload-text'>点击选择抽卡记录导出文件或将文件拖拽到此区域</p>
        <p className='ant-upload-text'>( 注：文件的后缀应为 .xlsx 或 .json )</p>
      </Dragger>
      <Alert
        css={css`
          margin: 20px auto;
          width: 100%;
          max-width: 600px;
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
  );
};
