import React, { FC } from 'react';
import { ITag } from '~/redux/types';
import { NodeTags } from '~/components/node/NodeTags';

interface IProps {
  tags: ITag[];
  canAppend: boolean;
  canDelete: boolean;
  isLoading: boolean;
  onChange: (tags: string[]) => void;
  onTagClick: (tag: Partial<ITag>) => void;
  onTagDelete: (id: ITag['ID']) => void;
}

const NodeTagsBlock: FC<IProps> = ({
  tags,
  canAppend,
  canDelete,
  isLoading,
  onChange,
  onTagClick,
  onTagDelete,
}) => {
  if (isLoading) {
    return null;
  }

  return (
    <NodeTags
      is_editable={canAppend}
      is_deletable={canDelete}
      tags={tags}
      onChange={onChange}
      onTagClick={onTagClick}
      onTagDelete={onTagDelete}
    />
  );
};

export { NodeTagsBlock };
