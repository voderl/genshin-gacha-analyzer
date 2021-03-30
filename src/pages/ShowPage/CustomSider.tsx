/** Sider 电脑端手机端对应不同的侧边栏 */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FC, memo } from 'react';
import { Layout, Menu } from 'antd';
import RawGithubCorner from 'react-github-corner';
import BarChartOutlined from '@ant-design/icons/BarChartOutlined';
import UnorderedListOutlined from '@ant-design/icons/UnorderedListOutlined';
import StarOutlined from '@ant-design/icons/StarOutlined';
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import { FriendLinks } from 'components/FriendLinks';

const { Sider, Header } = Layout;

interface CustomSiderProps {
  isVertical: boolean;
  activeMenu: string;
  onMenuChange: ({ key }: any) => any;
}

const GithubCorner = memo(
  ({ size }: { size: number }) => (
    <RawGithubCorner
      href='https://github.com/voderl/genshin-gacha-analyzer'
      target='_blank'
      direction='left'
      bannerColor='#70B7FD'
      octoColor='#fff'
      size={size}
    />
  ),
  (_, props) => _.size === props.size,
);

const isVerticalMenuStyle = css`
  .ant-menu-item {
    margin: 0 10px !important;
    height: 48px;
    line-height: 48px;
  }
`;
const notIsVerticalMenuStyle = css`
  margin-top: 80px;
  .ant-menu-item {
    height: 60px;
    line-height: 60px;
  }
`;
const CustomSider: FC<CustomSiderProps> = ({ isVertical, onMenuChange, activeMenu }) => {
  const children = [
    <GithubCorner size={isVertical ? 30 : 60} />,
    <Menu
      mode={isVertical ? 'horizontal' : 'inline'}
      defaultSelectedKeys={[activeMenu]}
      onSelect={onMenuChange}
      css={isVertical ? isVerticalMenuStyle : notIsVerticalMenuStyle}
    >
      <Menu.Item key='timeline' icon={<BarChartOutlined />}>
        时间轴
      </Menu.Item>
      <Menu.Item key='analysisChart' icon={<PieChartOutlined />}>
        分析图
      </Menu.Item>
      <Menu.Item key='achievements' icon={<StarOutlined />}>
        成就表
      </Menu.Item>
      <Menu.Item key='rawData' icon={<UnorderedListOutlined />}>
        原数据
      </Menu.Item>
    </Menu>,
  ];
  if (isVertical)
    return (
      <Header
        css={css`
          padding-left: 20px;
          padding-right: 0px;
          background: #fff;
          line-height: 56px;
        `}
      >
        {children}
      </Header>
    );
  return (
    <Sider
      breakpoint='lg'
      theme='light'
      width='15%'
      style={{
        height: '100vh',
      }}
    >
      {children}
      <FriendLinks mode='left' />
    </Sider>
  );
};

export default CustomSider;
