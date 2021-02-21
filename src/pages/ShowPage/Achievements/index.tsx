/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Divider } from 'antd';
import { AchievementCard, AchievementCardProps } from 'components/AchievementCard';
import { SHOW_DATA_ALL_KEY } from 'const';
import React, { FC, useMemo } from 'react';
import { Data, DataItem, StarCacheType, GachaCacheType, DayCacheType } from 'types';
import { achievements } from './achievements';

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
  return isChinese ? CN_SHEETS[key] : EN_SHEETS[key];
}
export const Achievements: FC<AchievementsProps> = function ({ onGetData, sheetNames }) {
  const allData = onGetData(SHOW_DATA_ALL_KEY);
  const allAchievements = useMemo(() => {
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
    return achievements
      .map((func) => func(info))
      .reduce((acc: Array<any>, cur: any) => {
        if (Array.isArray(cur)) return acc.concat(cur);
        if (typeof cur === 'object') acc.push(cur);
        return acc;
      }, []);
  }, []);
  return (
    <div
      css={css`
        background: #f0eae2;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        position: absolute;
      `}
    >
      {allAchievements.map((props) => (
        <AchievementCard {...props} />
      ))}
      <Divider>
        <a href='https://github.com/voderl/genshin-gacha-analyzer/issues' target='_blank'>
          更多成就开发中，欢迎前往issue提出你的建议...
        </a>
      </Divider>
    </div>
  );
};
