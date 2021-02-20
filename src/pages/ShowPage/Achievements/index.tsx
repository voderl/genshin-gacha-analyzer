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
};

export const Achievements: FC<AchievementsProps> = function ({ onGetData }) {
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
