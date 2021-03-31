/**
 * webkit browser like safari don't support time format "2020-09-28 10:25:28"
 */
const matchNumber = /\d+/g;
const InvalidDate = new Date('');
export default function parseToDate(date: any) {
  if (typeof date !== 'string') return new Date(date);
  const parts = date.match(matchNumber);
  if (parts === null) return InvalidDate;
  // @ts-ignore
  return new Date(parts[0], parts[1] && parseInt(parts[1]) - 1, ...parts.slice(2));
}
