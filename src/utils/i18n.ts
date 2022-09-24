// TODO: prepare for multi lang

export const i18n = (rawStringArr: TemplateStringsArray, ...list: any[]): string => {
  const text = [];
  for (let i = 0; i < rawStringArr.length; i++) {
    text.push(rawStringArr[i]);
    text.push(list[i] || ' ');
  }
  return text.join('');
};

export const getLocale = () => {};

export const setLocale = () => {};
