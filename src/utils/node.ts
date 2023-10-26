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

export const canLikeNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean => path(['role'], user) !== Role.Guest;

export const canStarNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean =>
  (path(['type'], node) === NODE_TYPES.IMAGE || !node?.is_public) &&
  path(['is_promoted'], node) === true &&
  path(['role'], user) === Role.Admin;
