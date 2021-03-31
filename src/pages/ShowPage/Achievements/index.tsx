/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, Divider, message } from 'antd';
import { AchievementCard, AchievementCardProps } from 'components/AchievementCard';
import { IconButton } from 'components/IconButton';
import ShareAltOutlined from '@ant-design/icons/ShareAltOutlined';
import FormOutlined from '@ant-design/icons/FormOutlined';
import MinusCircleTwoTone from '@ant-design/icons/MinusCircleTwoTone';
import PlusCircleTwoTone from '@ant-design/icons/PlusCircleTwoTone';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import { FONT_FAMILY_BOLD, FONT_FAMILY, SHOW_DATA_ALL_KEY, ISMOBILE } from 'const';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Data, DataItem, StarCacheType, GachaCacheType, DayCacheType } from 'types';
import { achievements as achievementsFunc } from './achievements';
import { renderToCanvas } from './renderToCanvas';
import { useCacheMemo } from 'context/CacheContext';
import { FriendLinks } from 'components/FriendLinks';
import renderPngTip from 'utils/renderPngTip';
import downloadCanvas from 'utils/downloadCanvas';
import parseToDate from 'utils/parseToDate';

type AchievementsProps = {
  onGetData: (key: string) => Data;
  sheetNames: string[];
};

export const POOLS = {
  CHARACTER: 0,
  WEAPON: 1,
  PERMANENT: 2,
  NOVICE: 3,
};
export const EN_SHEETS = [
  'Character Event Wish',
  'Weapon Event Wish',
  'Permanent Wish',
  'Novice Wish',
];
export const CN_SHEETS = ['角色活动祈愿', '武器活动祈愿', '常驻祈愿', '新手祈愿'];
function getSheetKey(key: any, sheetNames: string[]) {
  const isChinese = CN_SHEETS.indexOf(sheetNames[0]) !== -1;
  return isChinese ? CN_SHEETS[key] : sheetNames[key];
}
const iconCss = css`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  padding: 10px;
`;
const WrappedAchievementCard: FC<{
  isEditMode: boolean;
  visible: boolean;
  item: AchievementCardProps & {
    visible: boolean;
  };
}> = function ({ isEditMode, item, visible }) {
  const [isVisible, setVisible] = useState(visible);
  const handleHide = useCallback(() => {
    setVisible(!isVisible);
    item.visible = !isVisible;
  }, [isVisible]);
  return (
    <div style={{ opacity: isVisible ? 1 : 0.5, position: 'relative' }}>
      <AchievementCard {...item}>
        {isEditMode &&
          (isVisible ? (
            <MinusCircleTwoTone twoToneColor='#ee675c' css={iconCss} onClick={handleHide} />
          ) : (
            <PlusCircleTwoTone twoToneColor='#5bb974' css={iconCss} onClick={handleHide} />
          ))}
      </AchievementCard>
    </div>
  );
};
export const Achievements: FC<AchievementsProps> = function ({ onGetData, sheetNames }) {
  const allAchievements = useCacheMemo(
    () => {
      const allData = onGetData(SHOW_DATA_ALL_KEY);
      // 将数据分散到表里面，做一个缓存处理，方便对数据进行筛选
      const character: StarCacheType = {
        '5': {},
        '4': {},
      };
      const all: StarCacheType = {
        '5': {},
        '4': {},
        '3': {},
      };
      const weapon: StarCacheType = {
        '5': {},
        '4': {},
        '3': {},
      };
      const day: DayCacheType = {};
      const gacha: GachaCacheType = {
        10: [],
        1: [],
      };
      const pools = {
        character: onGetData(getSheetKey(POOLS.CHARACTER, sheetNames)),
        weapon: onGetData(getSheetKey(POOLS.WEAPON, sheetNames)),
        novice: onGetData(getSheetKey(POOLS.NOVICE, sheetNames)),
        permanent: onGetData(getSheetKey(POOLS.PERMANENT, sheetNames)),
      };
      const walk = (item: DataItem) => {
        let cache = item.类别 === '角色' ? character : weapon;
        if (item.名称 in all[item.星级]) all[item.星级][item.名称].data.push(item);
        else {
          all[item.星级][item.名称] = {
            data: [item],
          };
        }
        const currentDay = item.时间.slice(0, 10);
        if (currentDay in day) {
          day[currentDay].data.push(item);
        } else {
          day[currentDay] = { data: [item] };
        }
        if (!(item.名称 in cache[item.星级])) {
          cache[item.星级][item.名称] = {
            data: [item],
          };
        } else cache[item.星级][item.名称].data.push(item);
      };
      for (let i = 0, len = allData.length; i < len; ) {
        const current = allData[i];
        if (i < len - 1 && allData[i + 1].date === current.date) {
          const temp = allData.slice(i, i + 10);
          temp.forEach(walk);
          gacha[10].push({
            data: temp,
          });
          i = i + 10;
        } else {
          walk(current);
          gacha[1].push(current);
          i++;
        }
      }
      const info = {
        all,
        character,
        weapon,
        data: allData,
        gacha,
        day,
        pools,
      };
      if (process.env.NODE_ENV === 'development') console.log(info);
      const isDate = (str: string) => parseToDate(str).toString() !== 'Invalid Date';
      const result = achievementsFunc
        .map((func) => func(info))
        .reduce((acc: Array<any>, cur: any) => {
          if (Array.isArray(cur)) return acc.concat(cur);
          if (typeof cur === 'object') acc.push(cur);
          return acc;
        }, []);
      result.forEach((data) => {
        const achievedTime = data.achievedTime;
        if (achievedTime && isDate(achievedTime)) {
          data.achievedTime = achievedTime.slice(0, 10).replace(/-/g, '/');
        }
        data.visible = true;
      });
      return result;
    },
    [],
    'achievements',
  );
  const [achievements, setAchievements] = useState(allAchievements);
  const [isEditMode, setEditMode] = useState(false);
  const handleRenderPng = useCallback(() => {
    const data = achievements.filter((item) => item.visible !== false);
    renderPngTip((resolve, reject) => {
      renderToCanvas(data, (canvas, ctx) => {
        downloadCanvas(canvas, 'achievements.png', resolve);
      });
    });
  }, [achievements]);
  const handleEdit = useCallback(() => {
    setEditMode(!isEditMode);
    if (!isEditMode) {
      message.info('进入编辑模式，可以设置单个成就是否展示');
      setAchievements(allAchievements);
    } else setAchievements(allAchievements.filter((item) => item.visible));
  }, [isEditMode]);
  return (
    <div
      css={css`
        overflow: auto;
        background: #f0eae2;
        font-family: ${FONT_FAMILY_BOLD}, ${FONT_FAMILY};
      `}
    >
      {!ISMOBILE && (
        <div
          css={css`
            position: fixed;
            right: 8%;
            z-index: 999;
            top: 64px;
          `}
        >
          <IconButton
            placement='right'
            tip='生成图片'
            icon={<ShareAltOutlined />}
            onClick={handleRenderPng}
          />
          <br />
          <IconButton
            placement='right'
            tip={isEditMode ? '退出编辑' : '编辑成就'}
            icon={isEditMode ? <CloseOutlined /> : <FormOutlined />}
            onClick={handleEdit}
          />
        </div>
      )}
      {achievements.map((props) => (
        <WrappedAchievementCard
          key={props.title}
          item={props}
          visible={props.visible}
          isEditMode={isEditMode}
        />
      ))}
      <Button
        type='primary'
        css={css`
          display: block;
          margin: 10px auto;
        `}
        onClick={handleRenderPng}
      >
        生成图片
      </Button>
      <Divider>
        <a href='https://github.com/voderl/genshin-gacha-analyzer/issues' target='_blank'>
          更多成就开发中，欢迎前往issue提出你的建议...
        </a>
      </Divider>
      <FriendLinks mode='bottom' />
    </div>
  );
};
