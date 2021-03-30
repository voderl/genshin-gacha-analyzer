/**
 * webkit browser like safari don't support time format "2020-09-28 10:25:28"
 */
const matchNumber = /\d+/g;
const InvalidDate = new Date('');
export default function parseToDate(date: any) {
  if (typeof date !== 'string') return new Date(date);
  const parts = date.match(matchNumber);
  // @ts-ignore
  return parts === null ? InvalidDate : new Date(...parts);
}
