/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
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
      all[item.星级][item.名称] = {
        data: [item],
      };
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
    return achievements
      .map((func) =>
        func({
          all,
          character,
          weapon,
          data: allData,
          gacha,
          day,
        }),
      )
      .filter((v) => typeof v === 'object') as Array<AchievementCardProps>;
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
    </div>
  );
};
