function format(date: Date) {
  var mouth = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
  var day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
  return date.getFullYear() + '-' + mouth + '-' + day; // 返回 “年-月-日”格式
}

export function getDateInfo(begin: string, end: string) {
  var arr = [];
  var str_b = begin.split('-');
  var str_e = end.split('-');
  var date_b = new Date();
  // @ts-ignore
  date_b.setFullYear(str_b[0], str_b[1] - 1, str_b[2]);
  var date_e = new Date();
  // @ts-ignore
  date_e.setFullYear(str_e[0], str_e[1] - 1, str_e[2]);
  var unixDb = date_b.getTime();
  var unixDe = date_e.getTime();
  for (var j = unixDb; j <= unixDe; ) {
    arr.push(format(new Date(parseInt(j as any))));
    j = j + 24 * 60 * 60 * 1000;
  }
  return arr;
}
