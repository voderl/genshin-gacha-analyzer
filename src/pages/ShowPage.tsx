/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Button, Upload, Tabs } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import XLSX, { WorkSheet as WorkSheetType } from 'xlsx';
import GlobalContext from '../context/GlobalContext';
import { WorkSheet } from '../components/WorkSheet';

type ShowPageProps = {};

const { TabPane } = Tabs;

const schema = [
  { name: '时间', type: 'string', width: 180 },
  { name: '编号', type: 'number', hidden: true, width: 120 },
  { name: '名称', type: 'string', width: 130 },
  { name: '类别', type: 'string', width: 50 },
  { name: '星级', type: 'number', width: 50 },
  { name: '总次数', type: 'number', hidden: true, width: 100 },
  { name: '保底内', type: 'number', width: 80 },
];
const schemaAll = (schema as any).concat({
  name: 'pool',
  title: '池子名称',
  type: 'string',
  width: 120,
});
const ALL_KEY = '总览';
export const ShowPage: FC<ShowPageProps> = function () {
  const { workbook } = useContext(GlobalContext);
  const sheetNames = (workbook as any).SheetNames;
  const jsonCache = useRef({});
  const getJson = useMemo(() => {
    const cache = Object.create(null);
    function getJson(key: string) {
      if (key in cache) return cache[key];
      let data;
      if (key === ALL_KEY) {
        data = sheetNames.reduce((acc: Array<any>, cur: string) => acc.concat(getJson(cur)), []);
      } else {
        const sheet = (workbook as any).Sheets[key] as WorkSheetType;
        data = XLSX.utils.sheet_to_json(sheet);
        data.forEach((info: any) => {
          info.pool = key;
        });
      }
      return (cache.key = data);
    }
    return getJson;
  }, [workbook]);
  const [activekey, setActiveKey] = useState(sheetNames[0]);
  const handleChange = useCallback((key) => {
    setTimeout(() => setActiveKey(key));
  }, []);

  const currentSchema = activekey === ALL_KEY ? schemaAll : schema;
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        position: absolute;
        overflow: auto;
        width: 100%;
        height: 100%;
      `}
    >
      <Tabs activeKey={activekey} onChange={handleChange}>
        {sheetNames.map((name: string) => (
          <TabPane tab={name} key={name} />
        ))}
        <TabPane tab={ALL_KEY} key={ALL_KEY} />
      </Tabs>
      <div
        css={css`
          height: 100%;
          overflow: hidden;
          margin-bottom: 20px;
          border-bottom: 2px dotted thistle;
        `}
      >
        <WorkSheet data={getJson(activekey)} schema={currentSchema} />
      </div>
    </div>
  );
};
