import { FC, memo } from 'react';

import { Tags } from '~/containers/tags/Tags';
import { ITag } from '~/types';

interface Props {
  is_editable?: boolean;
  tags: ITag[];
  onChange?: (tags: string[]) => void;
}

const NodeTagsPlaceholder: FC<Props> = memo(
  ({ is_editable, tags, onChange }) => (
    <Tags tags={tags} editable={is_editable} onTagsChange={onChange} />
  ),
);

export { NodeTagsPlaceholder };
