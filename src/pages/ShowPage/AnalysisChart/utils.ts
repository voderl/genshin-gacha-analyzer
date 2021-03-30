import parseToDate from 'utils/parseToDate';

export const timeFormatter = (date: number) => parseToDate(date).toLocaleDateString();

export const percent = (num: number, total: number) => {
  return `${Math.round((num / total) * 10000) / 100}%`;
};

var percentColors = [
  { pct: 0.0, color: { r: 46, g: 200, b: 5 } },
  { pct: 0.77, color: { r: 67, g: 93, b: 250 } },
  { pct: 1.0, color: { r: 0xff, g: 0, b: 0 } },
];

export var getColorByPercent = function (pct: number) {
  for (var i = 1; i < percentColors.length - 1; i++) {
    if (pct < percentColors[i].pct) {
      break;
    }
  }
  var lower = percentColors[i - 1];
  var upper = percentColors[i];
  var range = upper.pct - lower.pct;
  var rangePct = (pct - lower.pct) / range;
  var pctLower = 1 - rangePct;
  var pctUpper = rangePct;
  var color = {
    r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
    g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
    b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
  };
  return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
  // or output as hex if preferred
};
