import { createContext, FC, useContext } from 'react';

import { ITag } from '~/types';

export interface TagContextProps {
  tags: ITag[];
  canAppend: boolean;
  canDelete: boolean;
  isLoading: boolean;
  onChange: (tags: string[]) => void;
  onTagClick: (tag: Partial<ITag>) => void;
  onTagDelete: (id: ITag['ID']) => void;
}

const TagContext = createContext<TagContextProps>({
  tags: [],
  canDelete: false,
  canAppend: false,
  isLoading: false,
  onChange: () => {},
  onTagClick: () => {},
  onTagDelete: () => {},
});

export const TagsContextProvider: FC<TagContextProps> = ({
  children,
  ...contextValue
}) => {
  return (
    <TagContext.Provider value={contextValue}>{children}</TagContext.Provider>
  );
};

export const useTagContext = () => useContext(TagContext);
