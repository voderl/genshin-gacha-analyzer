/**
 * 池子选择项, 默认的Select只是string或number，在此传回对象
 */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Select } from 'antd';
import React, { FC, useCallback, useMemo } from 'react';
import { PoolType } from 'types';

export type PoolSelectProps = {
  pools: PoolType[];
  value?: string | undefined;
  onChange?: (value: any) => void;
};
const { Option } = Select;
const makeKey = (pool: PoolType) => `${pool.name}(${pool.five.join('、')})`;
export const PoolSelect: FC<PoolSelectProps> = function ({ pools, value, onChange }) {
  const handleChange = useCallback(
    (index) => {
      onChange && onChange(pools[index]);
    },
    [pools],
  );
  const realValue = useMemo(() => {
    const idx = pools.indexOf(value as any);
    if (idx > -1) return idx;
    return undefined;
  }, [value, pools]);
  return (
    <Select placeholder='--选择UP池--' onChange={handleChange} allowClear value={realValue}>
      {pools.map((pool, index) => (
        <Option value={index}>{makeKey(pool)}</Option>
      ))}
    </Select>
  );
};
