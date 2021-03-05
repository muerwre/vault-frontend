import { curry } from 'ramda';
import { insert } from 'ramda';
import { nth } from 'ramda';
import { remove } from 'ramda';
import { ICommentGroup, IComment } from '~/redux/types';
import { path } from 'ramda';

export const moveArrItem = curry((at, to, list) => insert(to, nth(at, list), remove(at, 1, list)));
export const objFromArray = (array: any[], key: string) =>
  array.reduce((obj, el) => (key && el[key] ? { ...obj, [el[key]]: el } : obj), {});

export const groupCommentsByUser = (
  grouppedComments: ICommentGroup[],
  comment: IComment
): ICommentGroup[] => {
  const last: ICommentGroup | undefined = path([grouppedComments.length - 1], grouppedComments);

  if (!comment.user) {
    return grouppedComments;
  }

  return [
    ...(!last || path(['user', 'id'], last) !== path(['user', 'id'], comment)
      ? [
          // add new group
          ...grouppedComments,
          {
            user: comment.user,
            comments: [comment],
            ids: [comment.id],
          },
        ]
      : [
          // append to last group
          ...grouppedComments.slice(0, grouppedComments.length - 1),
          {
            ...last,
            comments: [...last.comments, comment],
            ids: [...last.ids, comment.id],
          },
        ]),
  ];
};
