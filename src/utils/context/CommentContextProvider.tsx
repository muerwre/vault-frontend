import { IComment, IFile } from '~/types';
import React, { createContext, FC, useContext } from 'react';

export interface CommentProviderProps {
  comments: IComment[];
  hasMore: boolean;
  lastSeenCurrent?: string;
  isLoading: boolean;
  onShowImageModal: (images: IFile[], index: number) => void;
  onLoadMoreComments: () => void;
  onSaveComment: (comment: IComment) => Promise<unknown>;
  onDeleteComment: (id: IComment['id'], isLocked: boolean) => void;
}

const CommentContext = createContext<CommentProviderProps>({
  // user: EMPTY_USER,
  comments: [],
  hasMore: false,
  lastSeenCurrent: undefined,
  isLoading: false,
  onSaveComment: async () => {},
  onShowImageModal: () => {},
  onLoadMoreComments: () => {},
  onDeleteComment: () => {},
});

export const CommentContextProvider: FC<CommentProviderProps> = ({ children, ...contextValue }) => {
  return <CommentContext.Provider value={contextValue}>{children}</CommentContext.Provider>;
};

export const useCommentContext = () => useContext(CommentContext);
