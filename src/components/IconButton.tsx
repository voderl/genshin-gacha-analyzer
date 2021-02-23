/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC } from 'react';
import { Button, ButtonProps, Tooltip, TooltipProps } from 'antd';

type IconButtonProps = {
  placement?: TooltipProps['placement'];
  tip?: TooltipProps['title'];
  icon: ButtonProps['icon'];
  onClick?: ButtonProps['onClick'];
};
const floatButtonStyle = css`
  width: 40px;
  height: 40px;
  background: #fff;
  color: #8590a6;
  font-size: 20px;
  box-shadow: 0 1px 3px rgb(18 18 18 / 10%);
  margin: 5px;
  border-color: transparent;
  border-radius: 4px;
  &:active {
    background: #fff;
    color: #8590a6;
  }
  &:focus {
    background: #fff;
    color: #8590a6;
  }
  &:hover {
    background: #d3d3d3;
  }
`;

export const IconButton: FC<IconButtonProps> = function ({ placement, tip, icon, onClick }) {
  return (
    <Tooltip placement={placement} title={tip}>
      <Button icon={icon} onClick={onClick} css={floatButtonStyle} type='text' />
    </Tooltip>
  );
};
