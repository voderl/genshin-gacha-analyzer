import { Data, DataItem, Source } from 'types';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import max from 'lodash/max';
import { AchievementCardProps } from 'components/AchievementCard';
import { CHARACTER_POOLS } from 'const';
import { isWeapon } from 'utils';

/**
 * 成就计算相互独立，每个为一个函数，传入给定的参数，返回规定的格式。具体参数和返回格式见下面。
 */
type Show = {
  单个数据类型: DataItem;
  函数返回类型: AchievementCardProps | AchievementCardProps[]; // 返回flase， undefined表示没有
  传入参数展示: {
    // 在开发模式下传入参数会在控制台输出
    character: {
      5: {
        七七: {
          data: DataItem[]; // 七七的所有抽卡记录
        };
      };
      4: '同上';
    };
    weapon: {
      5: {
        狼的末路: {
          data: DataItem[]; // 狼的末路的所有抽卡记录
        };
      };
      4: '同上';
      3: '同上';
    };
    all: '结构同上，包含角色与武器';
    gacha: {
      10: [DataItem[]]; // 十抽数据的数组,
      1: [DataItem]; // 单抽数据的数组
    };
    data: DataItem[]; // 全部抽卡记录源数据
    day: {
      // 不同天数的抽卡记录
      '2020-9-16': {
        data: DataItem[];
      };
    };
    pools: {
      character: DataItem[]; // 人物Up池所有抽卡
      weapon: DataItem[]; // 武器up池数据
      novice: DataItem[]; //  新手池数据
      permanent: DataItem[]; // 常驻池数据
    };
  };
};

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
const formatTime = (str: string) => str.slice(0, 10).replace(/-/g, '/');
const calculateTime = (t: number) => {
  var d = Math.floor(t / 1000 / 60 / 60 / 24);
  var h = Math.floor((t / 1000 / 60 / 60) % 24);
  return d + ' 天' + h + ' 时';
};
export const achievements: Array<(
  data: Source,
) => AchievementCardProps | AchievementCardProps[] | false | void> = [
  function maxGacha({ all }: Source) {
    const name = maxBy(Object.keys(all[5]), (cur) => {
      const items = all[5][cur].data;
      return (maxBy(items, (item) => item.保底内) as DataItem).保底内;
    });
    if (!name) return false;
    const item = maxBy(all[5][name].data, (item) => item.保底内);
    if (!item) return false;
    if (item.保底内 < 80) return;
    let info = '';
    if (item.保底内 >= 84) {
      info = ', 你竟是' + ['百', '千', '万', '十万', '百万'][item.保底内 - 84] + '里挑一的非酋!';
    }
    return {
      title: '「原来非酋竟是我自己」',
      info: `抽了 ${item.保底内} 次才最终抽到了「${item.名称}」${info}`,
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
    const count = item.保底内;
    if (count > 30) return;
    let info = '';
    if (count <= 5) info = `, 你的欧气无人能敌!`;
    return {
      title: '「欧皇时刻」',
      info: `只抽了 ${item.保底内} 次就抽到了「${item.名称}」${info}`,
      achievedTime: item.时间,
      value: item.保底内,
    };
  },
  // 不碰某些池子
  function ({ pools }) {
    const matches = [];
    if (pools.character.length === 0)
      matches.push({
        title: '「角色Up池? 不稀罕!」',
        info: '没有在「角色活动祈愿」中进行抽卡',
      });
    if (pools.weapon.length === 0)
      matches.push({
        title: '「武器池？能吃吗？」',
        info: '没有在「武器活动祈愿」中进行抽卡',
      });
    if (pools.novice.length === 0)
      matches.push({
        title: '「永远的新手」',
        info: '没有在「新手祈愿」中进行抽卡',
      });
    if (pools.permanent.length === 0)
      matches.push({
        title: '「传说中的毒池」',
        info: '没有在「常驻祈愿」中进行抽卡',
      });
    return matches;
  },
  // 人物Up池歪的比例
  function upWrong({ pools }) {
    const data = pools.character.filter((data) => data.星级 === 5);
    if (data.length === 0) return;
    // 是否是Up角色
    function isHitUp(item: DataItem) {
      const date = item.date;
      const pool = CHARACTER_POOLS.find((pool) => date >= pool.from && date <= pool.to);
      if (!pool) return false;
      return pool.five.includes(item.名称);
    }
    let notHitCount = 0,
      hitCount = 0;
    for (let i = 0; i < data.length; i++) {
      if (isHitUp(data[i])) {
        hitCount++;
      } else {
        i++;
        notHitCount++;
      }
    }
    const obj = {
      value: `${notHitCount} / ${hitCount + notHitCount}`,
      achievedTime: '小保底歪的概率',
    };
    if (notHitCount === 0)
      return {
        title: '「不倒翁」',
        info: `在「角色活动祈愿」中抽中的五星角色均为当期Up角色`,
        ...obj,
      };
    if (hitCount > notHitCount)
      return {
        title: '「晴时总比雨时多」',
        info: `在「角色活动祈愿」中，小保底偏向于抽中当期Up角色`,
        ...obj,
      };
    if (hitCount === notHitCount)
      return {
        title: '「晴雨各半」',
        info: `在「角色活动祈愿」中小保底歪与不歪持平`,
        ...obj,
      };
    return {
      title: '「雨时偏比晴时多」',
      info: `在「角色活动祈愿」中，小保底偏向于没有抽中当期Up角色`,
      ...obj,
    };
  },
  function maxGachaDay({ day, data }) {
    const _day = maxBy(Object.values(day), (today) => today.data.length);
    if (!_day) return false;
    const result = _day.data.filter((item) => item.星级 === 5);
    if (result.length === 0)
      return {
        // from nga @carry_tu (https://ngabbs.com/nuke.php?func=ucp&uid=41767591)
        title: '「最黑暗的一天」', // 最多抽数的一天且并没有出黄
        info: `在${formatTime(_day.data[0].时间)}这一天，你共抽取了 ${
          _day.data.length
        } 次，然而并没有出黄，是抽卡记录中最黑暗的一天`,
        achievedTime: _day.data[0].时间,
        value: _day.data.length,
      };
    const resultStr = `在抽到${formatByName(result).join('、')}时，你有没有很开心呢？`;
    return {
      title: '「豪掷千金」',
      info: `在${formatTime(_day.data[0].时间)}这一天，你共抽取了 ${
        _day.data.length
      } 次。${resultStr}`,
      achievedTime: _day.data[0].时间,
      value: _day.data.length,
    };
  },
  function CangshuExpert({ pools }) {
    const { character, weapon } = pools;
    const data = character
      .concat(weapon)
      .sort((a, b) => (a.date === b.date ? a.总次数 - b.总次数 : a.date - b.date));
    const waitTime = data.slice(1).map((v, index) => v.date - data[index].date);
    if (waitTime.length === 0) return;
    const maxWaitTime = max(waitTime as Array<number>);
    if (!maxWaitTime) return;
    const index = waitTime.indexOf(maxWaitTime);
    const fromTime = data[index].时间,
      endTime = data[index + 1].时间;
    const waitDay = maxWaitTime / 3600 / 24 / 1000;
    let level, info;
    if (waitDay <= 15) {
      level = '随缘';
      info = '是一只不太合格的仓鼠呢~';
    } else if (waitDay <= 30) {
      level = '合格';
      info = '你已经是一只合格的仓鼠了';
    } else if (waitDay <= 60) {
      level = '专家';
      info = '作为仓鼠，你就是专家!';
    } else {
      level = '大师';
      info = '您的传说受到了众仓鼠的景仰!';
    }
    return {
      title: `「${level}仓鼠」`,
      info: `从${formatTime(fromTime)}到${formatTime(
        endTime,
      )}没有使用「纠缠之缘」进行抽卡。${info}`,
      value: calculateTime(maxWaitTime),
      achievedTime: '持续时间',
    };
  },
  function oneGachaGetFiveStar({ gacha }) {
    const countLimit = 40; // 限制抽数，避免你看要保底了就单抽，而导致假的单抽出奇迹
    const percentLimit = 0.3;
    const starFilter = (item: DataItem) => item.星级 === 5;
    const limitFilter = (item: DataItem) => item.保底内 <= countLimit;
    const gacha1Data = gacha[1].filter(limitFilter); // 所有满足条件的单抽
    const gacha10Data = gacha[10].reduce((acc, cur) => {
      return acc.concat(cur.data.filter(limitFilter));
    }, [] as DataItem[]);
    const gacha1Count = gacha1Data.filter(starFilter).length;
    const gacha10Count = gacha10Data.filter(starFilter).length;
    if (gacha1Count === 0 && gacha10Count === 0) return;
    let info = [];
    if (gacha1Count) info.push(`通过单抽获取的数目为 ${gacha1Count}`);
    if (gacha10Count) info.push(`通过十连获取的数目为 ${gacha10Count}`);
    const data = {
      info: `在 ${countLimit} 抽内获取 5 星共计 ${gacha1Count + gacha10Count} 次，其中${info.join(
        '，',
      )}`,
    };
    if (gacha1Count / gacha10Count < percentLimit) {
      return {
        title: '「十连出奇迹(√)」',
        ...data,
      };
    }
    if (gacha10Count / gacha1Count < percentLimit) {
      return {
        title: '「单抽出奇迹！」',
        ...data,
      };
    }
    return {
      title: '「单抽出奇迹？」',
      ...data,
    };
  },
  function gacha10Data({ gacha }) {
    const gachaFiveStarCountArr = gacha[10].map(
      (item) => item.data.filter((v) => v.星级 === 5).length,
    );
    if (gachaFiveStarCountArr.length === 0) return;
    gachaFiveStarCountArr.sort((a, b) => b - a);
    const fiveStarCount = gachaFiveStarCountArr[0];
    if (fiveStarCount <= 1) return;
    const count = gachaFiveStarCountArr.lastIndexOf(fiveStarCount) + 1; // 达成次数
    const mapping = ['单', '双', '三', '四', '五', '六', '七', '八', '九', '十'];
    let extraInfo = '';
    if (fiveStarCount >= 3) extraInfo = '，你就是极致的欧皇!';
    return {
      title: `「${mapping[fiveStarCount - 1]}黄蛋!」`,
      info: `在一次十连中，你抽取到了 ${fiveStarCount} 只五星${extraInfo}`,
      value: count,
      achievedTime: '达成次数',
    };
  },
  function gacha10getMoreThanFive({ gacha }) {
    // github issue #5  @zhsitao (https://github.com/zhsitao)
    if (gacha[10].length === 0) return;
    const isFit = (item: DataItem) => item.星级 >= 4;
    function getFourFiveStarCount(data: DataItem[]) {
      let count = 0;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (isFit(item)) count++;
      }
      return count;
    }
    const list = gacha[10].filter(({ data }) => {
      return getFourFiveStarCount(data) >= 5;
    });
    if (list.length === 0) {
      const countMoreThanFourList = gacha[10].filter(({ data }) => {
        return getFourFiveStarCount(data) >= 4;
      });
      if (countMoreThanFourList.length === 0) return;
      return {
        title: '「四叶草」',
        info: `在一次十连中，抽取到 4 个或以上的 4 星或 5 星`,
        value: `${countMoreThanFourList.length}`,
        achievedTime: `达成次数`,
      };
    }
    return {
      title: '「福至五彩」',
      info: `在一次十连中，抽取到 5 个或以上的 4 星或 5 星`,
      value: `${list.length}`,
      achievedTime: `达成次数`,
    };
  },
  function characterMoreThanWeapon({ gacha }) {
    // github issue #5  @zhsitao (https://github.com/zhsitao)
    if (gacha[10].length === 0) return;
    function getWeaponCount(data: DataItem[]) {
      let count = 0;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (isWeapon(item)) count++;
      }
      return count;
    }
    const list = gacha[10].filter(({ data }) => {
      return getWeaponCount(data) <= 5;
    });
    if (list.length === 0) return;
    const maxData = minBy(list, ({ data }) => getWeaponCount(data))!;
    const maxCount = 10 - getWeaponCount(maxData.data);
    return {
      title: '「这才是角色池！」',
      info: `在一次十连中，抽出的角色不少于武器`,
      value: `角色：${maxCount}`,
      achievedTime: `${maxData.data[0].时间}`,
    };
  },
  function maxFiveStarCharacter({ character }) {
    const sortedData = Object.values(character[5]).sort((b, a) => a.data.length - b.data.length);
    if (sortedData.length === 0) return;
    const maxNum = sortedData[0].data.length;
    if (maxNum === 1) return;
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
    if (sortedData.length === 0) return;
    const maxNum = sortedData[0].data.length;
    if (maxNum === 1) return;
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
