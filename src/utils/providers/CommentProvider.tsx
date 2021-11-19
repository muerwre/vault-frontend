import { IComment, IFile } from '~/redux/types';
import React, { createContext, FC, useContext } from 'react';

export interface CommentProviderProps {
  // user: IUser;
  comments: IComment[];
  count: number;
  lastSeenCurrent?: string;
  isLoadingComments: boolean;
  onShowImageModal: (images: IFile[], index: number) => void;
  onLoadMoreComments: () => void;
  onDeleteComment: (id: IComment['id'], isLocked: boolean) => void;
}

const CommentContext = createContext<CommentProviderProps>({
  // user: EMPTY_USER,
  comments: [],
  count: 0,
  lastSeenCurrent: undefined,
  isLoadingComments: false,
  onShowImageModal: () => {},
  onLoadMoreComments: () => {},
  onDeleteComment: () => {},
});

export const CommentProvider: FC<CommentProviderProps> = ({ children, ...contextValue }) => {
  return <CommentContext.Provider value={contextValue}>{children}</CommentContext.Provider>;
};

export const useCommentContext = () => useContext(CommentContext);
