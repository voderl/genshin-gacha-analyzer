/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { Button, Alert, Input } from 'antd';
import { useGlobalContext } from 'context/GlobalContext';
import { FriendLinks } from 'components/FriendLinks';
import parseUrl, { Message } from './parseUrl';
import debounce from 'lodash/debounce';

type DownloadPageProps = {
  onLoad?: () => void;
};
// 预加载
// @ts-ignore
import('xlsx/dist/xlsx.mini.min.js');

export const DownloadPage: FC<DownloadPageProps> = function ({ onLoad }) {
  const [loading, setLoading] = useState<Boolean>(false);
  const [message, setMessage] = useState<Message>();
  const messageHistory = useRef<Message[]>([]);
  const exportFuncRef = useRef<any>();
  const [isValid, setValid] = useState(false);
  const [loadingTip, setLoadingTip] = useState('加载中...');
  const { updateWorkbook } = useGlobalContext();
  const handleExport = useCallback(() => {
    exportFuncRef.current && exportFuncRef.current();
  }, []);
  const handleInputChange = useMemo(() => {
    return debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      let valid = false;
      setMessage(undefined);
      const cb = parseUrl(value, (message) => {
        setMessage(message);
        messageHistory.current.push(message);
      });
      if (typeof cb === 'function') {
        valid = true;
        exportFuncRef.current = cb;
      }
      setValid(valid);
      console.log(cb);
    }, 100);
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
        <a href='https://ngabbs.com/read.php?tid=25657464' target='_blank'>
          <Alert
            message={
              <div>
                不知道如何获取抽卡记录导出文件？
                <Button type='link'>请点击这里</Button>
              </div>
            }
            type='info'
            showIcon
            banner
          />
        </a>
      </div>
      <div
        css={css`
          padding: 10px;
        `}
      >
        <Input.TextArea
          placeholder='test'
          onChange={handleInputChange}
          css={css`
            margin: 20px 0;
          `}
        />
        {isValid && (
          <Button
            type='primary'
            css={css`
              display: block;
              margin: 10px auto;
            `}
            onClick={handleExport}
          >
            导出数据
          </Button>
        )}
        {message && <Alert message={message.text} type={message.type} />}
      </div>

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
