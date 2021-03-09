/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Tooltip, TooltipProps } from 'antd';
import { FONT_FAMILY } from 'const';
import { useGlobalContext } from 'context/GlobalContext';
import { FC } from 'react';

interface FriendLinksProps {
  mode: 'left' | 'bottom';
  visible?: boolean;
}

type LinkType = {
  title: string;
  link: string;
  tip: string;
};

const Links: LinkType[] = [
  {
    title: '可莉特调',
    link: 'https://genshin.pub/',
    tip: '一些很好用的原神工具~',
  },
];
const EllipsisStyle = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
const Separator = () => <>/</>;
export const FriendLinks: FC<FriendLinksProps> = ({ mode, visible }) => {
  const { isVertical } = useGlobalContext();
  if (visible === false) return <></>;
  if (mode === 'bottom') {
    if (!isVertical && visible !== true) return <></>;
    return (
      <div
        css={css`
          text-align: center;
          font-size: 14px;
          padding-bottom: 12px;
          font-family: ${FONT_FAMILY};
        `}
      >
        <span>友情链接：</span>
        {Links.reduce((acc, { title, link, tip }, index) => {
          if (index === 0) acc.push(<Separator />);
          acc.push(
            <span
              key={title}
              css={css`
                padding: 8px 12px;
              `}
            >
              <Tooltip title={tip} placement='top'>
                <a target='_blank' href={link}>
                  {title}
                </a>
              </Tooltip>
            </span>,
          );
          acc.push(<Separator />);
          return acc;
        }, [] as any[])}
      </div>
    );
  }
  return (
    <div
      css={css`
        position: absolute;
        width: 100%;
        text-align: center;
        bottom: 20px;
        left: 0px;
        padding: 0;
        & > ul {
          padding-left: 0px;
        }
      `}
    >
      <span css={EllipsisStyle}>友情链接：</span>
      <ul>
        {Links.map(({ title, link, tip }) => (
          <li css={EllipsisStyle}>
            <Tooltip title={tip} placement='right' key={title}>
              <a target='_blank' href={link}>
                {title}
              </a>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
};
