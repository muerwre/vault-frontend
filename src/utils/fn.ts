import curry from 'ramda/es/curry';
import insert from 'ramda/es/insert';
import nth from 'ramda/es/nth';
import remove from 'ramda/es/remove';

export const moveArrItem = curry((at, to, list) => insert(to, nth(at, list), remove(at, 1, list)));
