/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, Input, Popover, Form } from 'antd';
import { ButtonSelect } from './ButtonSelect';
import { COLOR } from 'const';
import React, { FC, useCallback, useState } from 'react';
import FilterOutlined from '@ant-design/icons/FilterOutlined';

type FilterProps = {
  onChange?: (values: any) => any;
};

// 计算当前筛选条目有几个
function countObjectProperty(object: any): number {
  return Object.values(object).filter((v) => {
    if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return false;
    return true;
  }).length;
}
export const Filter: FC<FilterProps> = function ({ onChange }) {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [form] = Form.useForm();
  const handleVisibleChange = useCallback((v) => {
    setVisible(v);
    setCount(countObjectProperty(form.getFieldsValue(true)));
  }, []);
  const handleFinish = (values: any) => {
    onChange && onChange(values);
    handleVisibleChange(false);
  };
  const handleReset = (values: any) => {
    form.resetFields();
    onChange && onChange(form.getFieldsValue(true));
    handleVisibleChange(false);
  };
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
      <Button
        type='primary'
        css={css`
          position: absolute;
          top: 68px;
          z-index: 999;
        `}
        icon={<FilterOutlined />}
      >
        筛选{count === 0 ? '' : `(${count})`}
      </Button>
    </Popover>
  );
};
