/**
 * 按钮选择器。效果类似于checkBox
 */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button } from 'antd';
import React, { FC } from 'react';

export type ButtonSelectProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
};
type ButtonSelectItemProps = {
  name: string;
  enable?: boolean;
  onClick?: (e: any) => void;
};
const buttonStyle = css`
  margin: 2px 12px 2px 2px;
  border-radius: 5px;
`;
interface ButtonSelectInterface extends FC<ButtonSelectProps> {
  Item: FC<ButtonSelectItemProps>;
}

const Item: FC<ButtonSelectItemProps> = function ({ children, onClick, enable }) {
  return (
    <Button
      type='text'
      css={buttonStyle}
      style={
        enable
          ? {
              borderColor: '#1890ff',
              borderWidth: '2px',
              background: '#f0f0f0',
            }
          : {
              borderColor: 'transparent',
              borderWidth: '2px',
              background: '#f5f5f5',
            }
      }
      onClick={onClick}
    >
      {children}
    </Button>
  );
};
export const ButtonSelect: ButtonSelectInterface = function ({ value = [], children, onChange }) {
  return (
    <>
      {(Array.isArray(children) ? children : [children]).map((reactNode: any) => {
        const name = reactNode.props.name;
        const isEnable = value && value.includes(name);
        return (
          <Item
            key={name}
            name={name}
            enable={isEnable}
            onClick={(e) => {
              const data = [...value];
              if (!isEnable) data.push(name);
              else {
                const index = data.indexOf(name);
                if (index > -1) data.splice(index, 1);
              }
              onChange && onChange(data);
            }}
          >
            {reactNode.props.children}
          </Item>
        );
      })}
    </>
  );
};

ButtonSelect.Item = Item;
