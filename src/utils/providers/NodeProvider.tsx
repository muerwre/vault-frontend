import { INode } from '~/redux/types';
import { INodeRelated } from '~/redux/node/types';
import { EMPTY_NODE } from '~/redux/node/constants';
import React, { createContext, FC, useContext } from 'react';

export interface NodeContextProps {
  node: INode;
  related: INodeRelated;
  isLoading: boolean;
  // isUser: boolean;
  // user: IUser;
  // isLoadingComments: boolean;
  // lastSeenCurrent?: string;
  // commentsCount: number;
  // comments: IComment[];
  // onShowImageModal: (images: IFile[], index: number) => void;
  // onLoadMoreComments: () => void;
  // onDeleteComment: (id: IComment['id'], isLocked: boolean) => void;
  // onTagsChange: (tags: string[]) => void;
  // onTagClick: (tag: Partial<ITag>) => void;
  // onTagDelete: (id: ITag['ID']) => void;
}

export const NodeContext = createContext<NodeContextProps>({
  node: EMPTY_NODE,
  related: { albums: {}, similar: [] },
  isLoading: false,

  // UserContext
  // isUser: false,
  // CommentContext
  // user: EMPTY_USER,
  // lastSeenCurrent: undefined,
  // comments: [],
  // commentsCount: 0,
  // onLoadMoreComments: () => {},
  // onShowImageModal: () => {},
  // onDeleteComment: () => {},
  // isLoadingComments: false,

  // TagContext
  // onTagsChange: () => {},
  // onTagClick: () => {},
  // onTagDelete: () => {},
});

export const NodeProvider: FC<NodeContextProps> = ({ children, ...contextValue }) => {
  return <NodeContext.Provider value={contextValue}>{children}</NodeContext.Provider>;
};

export const useNodeContext = () => useContext(NodeContext);
