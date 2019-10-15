import curry from 'ramda/es/curry';
import insert from 'ramda/es/insert';
import nth from 'ramda/es/nth';
import remove from 'ramda/es/remove';
import { ICommentGroup, IComment } from '~/redux/types';
import path from 'ramda/es/path';

export const moveArrItem = curry((at, to, list) => insert(to, nth(at, list), remove(at, 1, list)));
export const objFromArray = (array: any[], key: string) =>
  array.reduce((obj, el) => (key && el[key] ? { ...obj, [el[key]]: el } : obj), {});

export const groupCommentsByUser = (
  result: ICommentGroup[],
  comment: IComment
): ICommentGroup[] => {
  const last: ICommentGroup = path([result.length - 1], result) || null;

  return [
    ...(!last || path(['user', 'id'], last) !== path(['user', 'id'], comment)
      ? [
          // add new group
          ...result,
          {
            user: comment.user,
            comments: [comment],
            ids: [comment.id],
          },
        ]
      : [
          // append to last group
          ...result.slice(0, result.length - 1),
          {
            ...last,
            comments: [...last.comments, comment],
            ids: [...last.ids, comment.id],
          },
        ]),
  ];
};

// const isSameComment = (comments, index) =>
//   comments[index - 1] && comments[index - 1].user.id === comments[index].user.id;
