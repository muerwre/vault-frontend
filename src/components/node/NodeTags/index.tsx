import React, { FC, memo } from 'react';
import { ITag } from '~/types';
import { Tags } from '~/containers/tags/Tags';

interface IProps {
  is_deletable?: boolean;
  is_editable?: boolean;
  tags: ITag[];
  onChange?: (tags: string[]) => void;
  onTagClick?: (tag: Partial<ITag>) => void;
  onTagDelete?: (id: ITag['ID']) => void;
}

const NodeTags: FC<IProps> = memo(
  ({ is_editable, is_deletable, tags, onChange, onTagClick, onTagDelete }) => {
    return (
      <Tags
        tags={tags}
        is_editable={is_editable}
        onTagsChange={onChange}
        onTagClick={onTagClick}
        onTagDelete={onTagDelete}
        is_deletable={is_deletable}
      />
    );
  }
);

export { NodeTags };
