import { differenceInDays, isAfter, isValid, parseISO } from 'date-fns';

import { IComment, ICommentGroup } from '~/types';
import { curry, insert, nth, path, remove } from '~/utils/ramda';

export const moveArrItem = curry((at, to, list) =>
  insert(to, nth(at, list), remove(at, 1, list)),
);
export const objFromArray = (array: any[], key: string) =>
  array.reduce(
    (obj, el) => (key && el[key] ? { ...obj, [el[key]]: el } : obj),
    {},
  );

const compareCommentDates = (
  commentDateValue?: string,
  lastSeenDateValue?: string,
) => {
  if (!commentDateValue || !lastSeenDateValue) {
    return false;
  }

  const commentDate = parseISO(commentDateValue);
  const lastSeenDate = parseISO(lastSeenDateValue);

  if (!isValid(commentDate) || !isValid(lastSeenDate)) {
    return false;
  }

  return isAfter(commentDate, lastSeenDate);
};

const getCommentDistance = (firstDate?: string, secondDate?: string) => {
  try {
    if (!firstDate || !secondDate) {
      return 0;
    }

    const first = parseISO(firstDate);
    const second = parseISO(secondDate);

    return differenceInDays(second, first);
  } catch (e) {
    return 0;
  }
};

export const groupCommentsByUser =
  (lastSeen?: string) =>
  (grouppedComments: ICommentGroup[], comment: IComment): ICommentGroup[] => {
    const last: ICommentGroup | undefined = path(
      [grouppedComments.length - 1],
      grouppedComments,
    );

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
              distancesInDays: [0],
              ids: [comment.id],
              hasNew: compareCommentDates(comment.created_at, lastSeen),
            },
          ]
        : [
            // append to last group
            ...grouppedComments.slice(0, grouppedComments.length - 1),
            {
              ...last,
              distancesInDays: [
                ...last.distancesInDays,
                getCommentDistance(
                  comment?.created_at,
                  last.comments[last.comments.length - 1]?.created_at,
                ),
              ],
              comments: [...last.comments, comment],
              ids: [...last.ids, comment.id],
              hasNew:
                last.hasNew ||
                compareCommentDates(comment.created_at, lastSeen),
            },
          ]),
    ];
  };
