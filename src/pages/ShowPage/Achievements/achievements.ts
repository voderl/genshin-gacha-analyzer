import { Data, DataItem, Source } from 'types';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import max from 'lodash/max';
import { AchievementCardProps } from 'components/AchievementCard';

/*

TODO: 是否是歪了up池，各个up池的持续时间 

*/
function toPercent(point: number) {
  return Number(point * 100).toFixed(2) + '%';
}
const defaultFormatter = (name: string, count: number) =>
  `「${name}」` + (count === 1 ? '' : `×${count}`);
function formatByName(data: Data, format = defaultFormatter) {
  const cache: any = {};
  data.forEach((item) => {
    if (item.名称 in cache) cache[item.名称] += 1;
    else cache[item.名称] = 1;
  });
  return Object.keys(cache).map((key) => format(key, cache[key]));
}
const formatTime = (str: string) => str.slice(0, 10).replaceAll('-', '/');
const calculateTime = (t: number) => {
  var d = Math.floor(t / 1000 / 60 / 60 / 24);
  var h = Math.floor((t / 1000 / 60 / 60) % 24);
  return d + ' 天' + h + ' 时';
};
export const achievements: Array<(data: Source) => AchievementCardProps | false | void> = [
  function maxGacha({ all }: Source) {
    const name = maxBy(Object.keys(all[5]), (cur) => {
      const items = all[5][cur].data;
      return (maxBy(items, (item) => item.保底内) as DataItem).保底内;
    });
    if (!name) return false;
    const item = maxBy(all[5][name].data, (item) => item.保底内);
    if (!item) return false;
    return {
      title: '「原来非酋竟是我自己」',
      info: `抽了 ${item.保底内} 次才最终抽到了「${item.名称}」`,
      achievedTime: item.时间,
      value: item.保底内,
    };
  },
  function minGacha({ all }: Source) {
    const name = minBy(Object.keys(all[5]), (cur) => {
      const items = all[5][cur].data;
      return (minBy(items, (item) => item.保底内) as DataItem).保底内;
    });
    if (!name) return false;
    const item = minBy(all[5][name].data, (item) => item.保底内);
    if (!item) return false;
    return {
      title: '「欧皇在世」',
      info: `只抽了 ${item.保底内} 次就抽到了「${item.名称}」`,
      achievedTime: item.时间,
      value: item.保底内,
    };
  },
  function maxGachaDay({ day, data }) {
    const _day = maxBy(Object.values(day), (today) => today.data.length);
    if (!_day) return false;
    const percent = _day.data.length / data.length;
    const result = _day.data.filter((item) => item.星级 === 5);
    const resultStr =
      result.length === 0 ? '' : `在抽到${formatByName(result).join('、')}时，你有没有很开心呢？`;
    return {
      title: '「豪掷千金」',
      info: `在${formatTime(_day.data[0].时间)}这一天，你共抽取了 ${
        _day.data.length
      } 次，占总抽取次数的${toPercent(percent)}。${resultStr}`,
      achievedTime: _day.data[0].时间,
      value: _day.data.length,
    };
  },
  function CangshuExpert({ data }) {
    const waitTime = data.slice(1).map((v, index) => v.date - data[index].date);
    if (waitTime.length === 0) return;
    const maxWaitTime = max(waitTime as Array<number>);
    if (!maxWaitTime) return;
    const index = waitTime.indexOf(maxWaitTime);
    const fromTime = data[index].时间,
      endTime = data[index + 1].时间;
    return {
      title: '「仓鼠专家」',
      info: `从${formatTime(fromTime)}到${formatTime(
        endTime,
      )}, 你没有进行抽卡，享受着属于仓鼠的快乐~`,
      value: calculateTime(maxWaitTime),
      achievedTime: endTime,
    };
  },
  function oneGachaGetFiveStar({ gacha }) {
    const gacha10Count = Object.values(gacha[10]).reduce((acc, cur) => {
      return acc + cur.data.filter((v) => v.星级 === 5).length;
    }, 0);
    const gacha1Count = gacha[1].filter((v) => v.星级 === 5).length;
    return {
      title: '「单抽出奇迹？」',
      info: `通过单抽获取的五星数目为 ${gacha1Count} , 通过十连获取的五星数目为 ${gacha10Count} `,
      value: `${gacha1Count}/${gacha1Count + gacha10Count}`,
    };
  },
  function gacha10Data({ gacha }) {
    const maxGacha = maxBy(gacha[10], (item) => {
      return item.data.filter((v) => v.星级 === 5).length;
    });
    if (!maxGacha) return;
    const count = maxGacha.data.filter((v) => v.星级 === 5).length;
    return {
      title: '「双黄蛋？」',
      info: `一次十连中，你最多抽取到的五星数量为 ${count} 只`,
      value: count,
      achievedTime: maxGacha.data[0].时间,
    };
  },
  function maxFiveStarCharacter({ character }) {
    const sortedData = Object.values(character[5]).sort((b, a) => a.data.length - b.data.length);
    const maxNum = sortedData[0].data.length;
    const endIndex = sortedData.findIndex((v) => v.data.length !== maxNum);
    const names = sortedData
      .slice(0, endIndex)
      .map((item) => defaultFormatter(item.data[0].名称, item.data.length));
    return {
      title: '「情有独钟(五星角色)」',
      info: `你共抽取了 ${names.join('、')}，这是上天对你的眷顾还是你对${
        names.length === 1 ? ' ta ' : '他们'
      }的情有独钟呢？`,
    };
  },
  function maxFourStarCharacter({ character }) {
    const sortedData = Object.values(character[4]).sort((b, a) => a.data.length - b.data.length);
    const maxNum = sortedData[0].data.length;
    const endIndex = sortedData.findIndex((v) => v.data.length !== maxNum);
    const names = sortedData
      .slice(0, endIndex)
      .map((item) => defaultFormatter(item.data[0].名称, item.data.length));
    return {
      title: '「情有独钟(四星角色)」',
      info: `你共抽取了 ${names.join('、')}，这是上天对你的眷顾还是你对${
        names.length === 1 ? ' ta ' : '他们'
      }的情有独钟呢？`,
    };
  },
];
