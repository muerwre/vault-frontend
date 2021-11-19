import { IComment, IFile, INode } from '~/redux/types';
import { IUser } from '~/redux/auth/types';
import React, { createContext, FC, useContext } from 'react';
import { EMPTY_USER } from '~/redux/auth/constants';
import { EMPTY_NODE } from '~/redux/node/constants';

export interface CommentProviderProps {
  node: INode;
  user: IUser;
  comments: IComment[];
  count: number;
  lastSeenCurrent?: string;
  isLoadingNode: boolean;
  isLoadingComments: boolean;
  onShowImageModal: (images: IFile[], index: number) => void;
  onLoadMoreComments: () => void;
  onDeleteComment: (id: IComment['id'], isLocked: boolean) => void;
}

const CommentContext = createContext<CommentProviderProps>({
  node: EMPTY_NODE,
  user: EMPTY_USER,
  comments: [],
  count: 0,
  lastSeenCurrent: undefined,
  isLoadingNode: false,
  isLoadingComments: false,
  onShowImageModal: () => {},
  onLoadMoreComments: () => {},
  onDeleteComment: () => {},
});

export const CommentProvider: FC<CommentProviderProps> = ({ children, ...contextValue }) => {
  return <CommentContext.Provider value={contextValue}>{children}</CommentContext.Provider>;
};

export const useCommentContext = () => useContext(CommentContext);
