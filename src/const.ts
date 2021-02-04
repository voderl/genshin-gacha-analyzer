export const SHOW_DATA_ALL_KEY = '总览';

export const SCHEMA = [
  { name: '时间', type: 'string', width: 180 },
  { name: '编号', type: 'number', hidden: true, width: 120 },
  { name: '名称', type: 'string', width: 130 },
  { name: '类别', type: 'string', width: 50 },
  { name: '星级', type: 'number', width: 50 },
  { name: '总次数', type: 'number', hidden: true, width: 100 },
  { name: '保底内', type: 'number', width: 80 },
];
export const SCHEMA_ALL = (SCHEMA as any).concat({
  name: 'pool',
  title: '池子名称',
  type: 'string',
  width: 120,
});
