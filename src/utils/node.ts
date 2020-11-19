import { USER_ROLES } from '~/redux/auth/constants';
import { ICommentGroup, IFile, INode } from '~/redux/types';
import { IUser } from '~/redux/auth/types';
import { path } from 'ramda';
import { NODE_TYPES } from '~/redux/node/constants';
import { useMemo } from 'react';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';

export const canEditNode = (node: Partial<INode>, user: Partial<IUser>): boolean =>
  path(['role'], user) === USER_ROLES.ADMIN ||
  (path(['user', 'id'], node) && path(['user', 'id'], node) === path(['id'], user));

export const canEditComment = (comment: Partial<ICommentGroup>, user: Partial<IUser>): boolean =>
  path(['role'], user) === USER_ROLES.ADMIN ||
  (path(['user', 'id'], comment) && path(['user', 'id'], comment) === path(['id'], user));

export const canLikeNode = (node: Partial<INode>, user: Partial<IUser>): boolean =>
  path(['role'], user) && path(['role'], user) !== USER_ROLES.GUEST;

export const canStarNode = (node: Partial<INode>, user: Partial<IUser>): boolean =>
  node.type === NODE_TYPES.IMAGE &&
  path(['role'], user) &&
  path(['role'], user) === USER_ROLES.ADMIN;

export const useNodeImages = (node: INode): IFile[] => {
  return useMemo(
    () =>
      (node && node.files && node.files.filter(({ type }) => type === UPLOAD_TYPES.IMAGE)) || [],
    [node.files]
  );
};
