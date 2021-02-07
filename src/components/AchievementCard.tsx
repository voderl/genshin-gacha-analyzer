/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useCallback, useMemo } from 'react';
import UnAchievedPng from 'resource/achievement_unachieve.png';
import AchievedPng from 'resource/achievement_achieved.png';
import ShowPng from 'resource/achievement_show.png';

export type AchievementCardProps = {
  title: string;
  info: string;
  value?: string | number;
  achievedTime?: string;
};

export const AchievementCard: FC<AchievementCardProps> = function ({
  title,
  info,
  value,
  achievedTime,
}) {
  const isAchieved = !!achievedTime;
  return (
    <div
      style={{
        // backgroundColor: isAchieved ? '#ebe2d8' : '#f5f1eb',
        backgroundColor: '#ebe2d8',
      }}
      css={css`
        width: 100%;
        max-width: 800px;
        min-height: 119px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 2px solid #e0d6cb;
        color: #bca895;
        color: #a0907c;
        font-size: 16px;
        font-weight: 600;
        margin: 4px auto;
      `}
    >
      <img
        src={/* isAchieved ? AchievedPng : UnAchievedPng */ AchievedPng}
        css={css`
          margin: 0 16px;
          flex: 0 1;
          width: 104px;
          height: 104px;
        `}
      />
      <div
        css={css`
          flex: 1 1;
          padding: 12px 0;
          p {
            margin-bottom: 4px;
          }
        `}
      >
        <p
          css={css`
            color: #585757;
            font-weight: bold;
            font-size: 20px;
          `}
        >
          {title}
        </p>
        <p>{info}</p>
      </div>
      {isAchieved ? (
        <div
          css={css`
            width: 147px;
            margin-left: 13px;
            height: 119px;
            flex: none;
            background-image: url(${ShowPng});
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
          `}
        >
          <span
            css={css`
              font-size: 18px;
            `}
          >
            {value === undefined ? '达成' : value}
          </span>
          <span
            css={css`
              padding: 10px 0 8px;
              font-size: 18px;
            `}
          >
            {(achievedTime as string).slice(0, 10).replaceAll('-', '/')}
          </span>
        </div>
      ) : (
        <div
          css={css`
            width: 160px;
            height: 120px;
            background-color: #ebe2d8;
            text-align: center;
          `}
        >
          <span
            css={css`
              line-height: 120px;
              height: 120px;
              font-size: 18px;
            `}
          >
            {value}
          </span>
        </div>
      )}
    </div>
  );
};
