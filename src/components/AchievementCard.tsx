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
  children,
}) {
  const isAchieved = !!achievedTime;
  return (
    <div
      style={{
        // backgroundColor: isAchieved ? '#ebe2d8' : '#f5f1eb',
        backgroundColor: '#ebe2d8',
      }}
      css={css`
        position: relative;
        width: 100%;
        max-width: 800px;
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 2px solid #e0d6cb;
        color: #bca895;
        color: #988b81;
        font-size: 16px;
        margin: 4px auto;
      `}
    >
      {children}
      <img
        src={/* isAchieved ? AchievedPng : UnAchievedPng */ AchievedPng}
        width='104'
        height='104'
        css={css`
          margin: 0 16px;
          width: 80px;
          height: 80px;
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
            width: 128px;
            margin-left: 12px;
            height: 96px;
            background: url(${ShowPng}) no-repeat right/cover;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
          `}
        >
          <span
            css={css`
              font-size: 20px;
            `}
          >
            {value === undefined ? '达成' : value}
          </span>
          <span
            css={css`
              padding: 8px 0 0px;
              font-size: 15px;
            `}
          >
            {achievedTime}
          </span>
        </div>
      ) : (
        value !== undefined && (
          <div
            css={css`
              width: 128px;
              height: 96px;
              background-color: #ebe2d8;
              text-align: center;
            `}
          >
            <span
              css={css`
                line-height: 96px;
                font-size: 20px;
              `}
            >
              {value}
            </span>
          </div>
        )
      )}
    </div>
  );
};
