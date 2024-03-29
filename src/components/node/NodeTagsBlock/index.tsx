import { FC } from 'react';

import { NodeTags } from '~/components/node/NodeTags';
import { useTagContext } from '~/utils/context/TagsContextProvider';

interface Props {}

const NodeTagsBlock: FC<Props> = () => {
  const {
    tags,
    canAppend,
    canDelete,
    isLoading,
    onChange,
    onTagClick,
    onTagDelete,
  } = useTagContext();

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
