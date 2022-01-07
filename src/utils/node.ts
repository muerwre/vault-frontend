import { USER_ROLES } from '~/redux/auth/constants';
import { ICommentGroup, INode } from '~/redux/types';
import { IUser } from '~/redux/auth/types';
import { path } from 'ramda';
import { NODE_TYPES } from '~/constants/node';

export const canEditNode = (node?: Partial<INode>, user?: Partial<IUser>): boolean =>
  path(['role'], user) === USER_ROLES.ADMIN || path(['user', 'id'], node) === path(['id'], user);

export const canEditComment = (comment?: Partial<ICommentGroup>, user?: Partial<IUser>): boolean =>
  path(['role'], user) === USER_ROLES.ADMIN || path(['user', 'id'], comment) === path(['id'], user);

export const canLikeNode = (node?: Partial<INode>, user?: Partial<IUser>): boolean =>
  path(['role'], user) !== USER_ROLES.GUEST;

export const canStarNode = (node?: Partial<INode>, user?: Partial<IUser>): boolean =>
  path(['type'], node) === NODE_TYPES.IMAGE &&
  path(['is_promoted'], node) === false &&
  path(['role'], user) === USER_ROLES.ADMIN;
