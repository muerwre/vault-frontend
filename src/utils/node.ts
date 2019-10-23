import { USER_ROLES } from '~/redux/auth/constants';
import { INode } from '~/redux/types';
import { IUser } from '~/redux/auth/types';
import path from 'ramda/es/path';

export const canEditNode = (node: Partial<INode>, user: Partial<IUser>): boolean =>
  path(['role'], user) === USER_ROLES.ADMIN ||
  (path(['user', 'id'], node) && path(['user', 'id'], node) === path(['id'], user));

export const canLikeNode = (node: Partial<INode>, user: Partial<IUser>): boolean =>
  path(['role'], user) && path(['role'], user) !== USER_ROLES.GUEST;

export const canStarNode = (node: Partial<INode>, user: Partial<IUser>): boolean =>
  path(['role'], user) && path(['role'], user) === USER_ROLES.ADMIN;
