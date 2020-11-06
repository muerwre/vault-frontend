import React, { FC, HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react';
import { TagField } from '~/components/containers/TagField';
import { ITag } from '~/redux/types';
import uniq from 'ramda/es/uniq';
import { Tag } from '~/components/tags/Tag';
import { TagInput } from '~/components/tags/TagInput';
import { separateTags } from '~/utils/tag';

type IProps = HTMLAttributes<HTMLDivElement> & {
  tags: Partial<ITag>[];
  is_editable?: boolean;
  onTagsChange?: (tags: string[]) => void;
  onTagClick?: (tag: Partial<ITag>) => void;
};

export const Tags: FC<IProps> = ({ tags, is_editable, onTagsChange, onTagClick, ...props }) => {
  const [data, setData] = useState<string[]>([]);

  const [catTags, ordinaryTags] = useMemo(() => separateTags(tags), [tags]);

  const onSubmit = useCallback(
    (last: string[]) => {
      const exist = tags.map(tag => tag.title);
      onTagsChange(uniq([...exist, ...data, ...last]));
    },
    [data]
  );

  useEffect(() => {
    setData(data.filter(title => !tags.some(tag => tag.title.trim() === title.trim())));
  }, [tags]);

  const onAppendTag = useCallback(
    (created: string[]) => {
      setData(uniq([...data, ...created]).filter(title => !tags.some(it => it.title === title)));
    },
    [data, setData, tags]
  );

  const onClearTag = useCallback((): string | undefined => {
    if (!data.length) return;
    const last = data[data.length - 1];
    setData(data.slice(0, data.length - 1));
    return last;
  }, [data, setData]);

  const exclude = useMemo(() => [...(data || []), ...(tags || []).map(({ title }) => title)], [
    data,
    tags,
  ]);

  return (
    <TagField {...props}>
      {catTags.map(tag => (
        <Tag key={tag.title} tag={tag} onClick={onTagClick} />
      ))}

      {ordinaryTags.map(tag => (
        <Tag key={tag.title} tag={tag} onClick={onTagClick} />
      ))}

      {data.map(title => (
        <Tag key={title} tag={{ title }} is_editing />
      ))}

      {is_editable && (
        <TagInput
          onAppend={onAppendTag}
          onClearTag={onClearTag}
          onSubmit={onSubmit}
          exclude={exclude}
        />
      )}
    </TagField>
  );
};
