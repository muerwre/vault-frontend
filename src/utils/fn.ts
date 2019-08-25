import curry from 'ramda/es/curry';
import insert from 'ramda/es/insert';
import nth from 'ramda/es/nth';
import remove from 'ramda/es/remove';

export const moveArrItem = curry((at, to, list) => insert(to, nth(at, list), remove(at, 1, list)));
export const objFromArray = (array: any[], key: string) =>
  array.reduce((obj, el) => (key && el[key] ? { ...obj, [el[key]]: el } : obj), {});
