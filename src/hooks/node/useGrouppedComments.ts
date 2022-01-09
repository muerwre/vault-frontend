import { IComment } from '~/types';
import { useMemo } from 'react';
import { groupCommentsByUser } from '~/utils/fn';

export const useGrouppedComments = (
  comments: IComment[],
  order: 'ASC' | 'DESC',
  lastSeen?: string
) =>
  useMemo(
    () =>
      (order === 'DESC' ? [...comments].reverse() : comments).reduce(
        groupCommentsByUser(lastSeen),
        []
      ),
    [comments, lastSeen, order]
  );
