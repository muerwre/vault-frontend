import { Role } from '~/constants/auth';
import { NODE_TYPES } from '~/constants/node';
import { ICommentGroup, INode } from '~/types';
import { IUser } from '~/types/auth';
import { path } from '~/utils/ramda';

export const canEditNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean =>
  path(['role'], user) === Role.Admin ||
  path(['user', 'id'], node) === path(['id'], user);

export const canEditComment = (
  comment?: Partial<ICommentGroup>,
  user?: Partial<IUser>,
): boolean =>
  path(['role'], user) === Role.Admin ||
  path(['user', 'id'], comment) === path(['id'], user);

export const canLikeComment = (
  comment?: Partial<ICommentGroup>,
  user?: Partial<IUser>,
): boolean =>
  Boolean(
    user?.role &&
      user?.id &&
      user?.role !== Role.Guest &&
      user.id !== comment?.user?.id,
  );

export const canLikeNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean => path(['role'], user) !== Role.Guest;

export const canStarNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean =>
  !!node &&
  !!user &&
  (node.type === NODE_TYPES.IMAGE || !node.is_promoted) &&
  user.role === Role.Admin;
