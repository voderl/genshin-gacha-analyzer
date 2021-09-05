/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, Input, Popover, Form } from 'antd';
import { ButtonSelect } from './ButtonSelect';
import { CHARACTER_POOLS, WEAPON_POOLS, COLOR } from 'const';
import React, { FC, useCallback, useState, useMemo, useEffect } from 'react';
import FilterOutlined from '@ant-design/icons/FilterOutlined';
import { PoolSelect } from './PoolSelect';
import { DataItem, PoolType } from 'types';
import findIndex from 'lodash/findIndex';
import { useCacheMemo } from 'context/CacheContext';

type FilterProps = {
  activeKey?: string;
  onChange?: (values: any) => any;
  data: DataItem[];
  [key: string]: any;
};
// 根据值数组 做一个filter
function makeFilterByArray(array: any[], format?: (v: any) => any) {
  const handle = (v: any) => (typeof v === 'string' ? '"' + v + '"' : v);
  const expr =
    'return ' + array.map((value) => `v===${handle(format ? format(value) : value)}`).join('||');
  return new Function('v', expr);
}
// 测试字符串是不是值的一部分，支持正则
const filterString = function (value: string, filterFor: string) {
  var filterRegExp,
    regEnd = /\/(i|g|m)*$/,
    pattern = regEnd.exec(filterFor),
    flags = pattern ? pattern[0].substring(1) : '',
    flagLength = flags.length;
  if (filterFor.substring(0, 1) === '/' && pattern) {
    try {
      filterRegExp = new RegExp(filterFor.substring(1, filterFor.length - (flagLength + 1)), flags);
    } catch (e) {
      return;
    }
    return filterRegExp.test(value);
  }
  return value.toString
    ? value.toString().toLocaleUpperCase().indexOf(filterFor.toLocaleUpperCase()) !== -1
    : false;
};
// 根据form的值， 做一个filter
function makeFilterByForm(values: {
  pool?: {
    from: number;
    to: number;
  };
  search?: string;
  star: string[];
  type: string[];
}) {
  const matchs: any[] = [];
  const { type = [], star = [], search, pool } = values;
  if (type.length !== 0) {
    const mapping = {
      weapon: '武器',
      character: '角色',
    };
    const compare = makeFilterByArray(type, (key: keyof typeof mapping) => mapping[key]);
    matchs.push((data: DataItem) => compare(data.类别));
  }
  if (star.length !== 0) {
    const compare = makeFilterByArray(star, (key: string) => parseInt(key));
    matchs.push((data: DataItem) => compare(data.星级));
  }
  if (pool) matchs.push((data: DataItem) => data.date >= pool.from && data.date <= pool.to);

  if (search) matchs.push((data: DataItem) => filterString(data.名称, search));

  return matchs.length === 0
    ? undefined
    : (data: DataItem) => {
        return matchs.every((func) => func(data));
      };
}
// 计算当前筛选条目有几个
function countObjectProperty(object: any): number {
  return Object.values(object).filter((v) => {
    if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return false;
    return true;
  }).length;
}
export const Filter: FC<FilterProps> = function ({ activeKey, onChange, data, ...props }) {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [form] = Form.useForm();
  const handleVisibleChange = useCallback((v) => {
    setVisible(v);
    setCount(countObjectProperty(form.getFieldsValue(true)));
  }, []);
  const handleFormChange = useCallback((v?: any) => {
    onChange && onChange(makeFilterByForm(v || form.getFieldsValue(true)));
  }, []);
  const pools = useMemo(() => {
    // 切换页面时应重置filter
    form.setFields([
      {
        name: 'pool',
        value: undefined,
      },
    ]);
    handleFormChange();
    switch (activeKey) {
      case '角色活动祈愿':
      case 'Character Event Wish':
        return CHARACTER_POOLS;
      case '武器活动祈愿':
      case 'Weapon Event Wish':
        return WEAPON_POOLS;
      default:
        return [];
    }
  }, [activeKey]);
  const filteredPools = useCacheMemo(
    () => {
      // 只显示有抽卡记录的池子
      if (pools.length === 0) return pools;
      let filteredPools = [] as PoolType[];
      let hitPoolIndex = 0;
      let dataIndex = 0;
      try {
        while (true) {
          if (dataIndex >= data.length - 1) break;
          const item = data[dataIndex];
          const pool = pools[hitPoolIndex];
          if (item.date > pool.to) {
            hitPoolIndex += 1;
            if (hitPoolIndex > pools.length - 1) throw new Error('wrong data');
          } else if (item.date >= pool.from) {
            const idx = findIndex(data, (o) => o.date > pool.to, dataIndex + 1);
            filteredPools.push(pool);
            if (idx === -1) {
              break;
            }
            dataIndex = idx;
          } else {
            throw new Error('impossible data');
          }
        }
      } catch (e) {
        console.error(e);
        filteredPools = pools;
      }
      return filteredPools.reverse();
    },
    [pools, data],
    `filter-${activeKey}`,
  );
  const handleFinish = useCallback((values: any) => {
    handleFormChange(values);
    handleVisibleChange(false);
  }, []);
  const handleReset = useCallback((values: any) => {
    form.resetFields();
    handleFormChange();
    handleVisibleChange(false);
  }, []);
  const content = (
    <Form
      layout='vertical'
      css={css`
        max-width: 260px;
      `}
      onFinish={handleFinish}
      form={form}
    >
      <Form.Item name='search'>
        <Input placeholder='搜索名称请输入...' />
      </Form.Item>
      <Form.Item name='type' initialValue={[]}>
        <ButtonSelect>
          <ButtonSelect.Item name='weapon'>武器</ButtonSelect.Item>
          <ButtonSelect.Item name='character'>角色</ButtonSelect.Item>
        </ButtonSelect>
      </Form.Item>
      <Form.Item name='star' initialValue={[]}>
        <ButtonSelect>
          <ButtonSelect.Item name='3'>
            <div>三星</div>
          </ButtonSelect.Item>
          <ButtonSelect.Item name='4'>
            <div style={{ color: COLOR.FOUR_STAR }}>四星</div>
          </ButtonSelect.Item>
          <ButtonSelect.Item name='5'>
            <div style={{ color: COLOR.FIVE_STAR }}>五星</div>
          </ButtonSelect.Item>
        </ButtonSelect>
      </Form.Item>
      <Form.Item name='pool' hidden={filteredPools.length === 0}>
        <PoolSelect pools={filteredPools} />
      </Form.Item>
      <Form.Item
        css={css`
          .ant-form-item-control-input-content {
            display: flex;
            justify-content: space-between;
          }
        `}
      >
        <Button onClick={handleReset}>重置</Button>
        <Button type='primary' htmlType='submit'>
          确认
        </Button>
      </Form.Item>
    </Form>
  );
  return (
    <Popover
      content={content}
      trigger='click'
      placement='bottomLeft'
      title='筛选(以下均不是必填项)'
      visible={visible}
      onVisibleChange={handleVisibleChange}
    >
      <Button type='primary' icon={<FilterOutlined />} {...props}>
        筛选{count === 0 ? '' : `(${count})`}
      </Button>
    </Popover>
  );
};
