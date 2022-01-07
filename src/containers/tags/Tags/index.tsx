import React, { FC, HTMLAttributes, useCallback, useMemo, useState } from "react";
import { TagField } from "~/components/containers/TagField";
import { ITag } from "~/redux/types";
import { uniq } from "ramda";
import { Tag } from "~/components/tags/Tag";
import { TagInput } from "~/containers/tags/TagInput";
import { separateTags } from "~/utils/tag";

type IProps = HTMLAttributes<HTMLDivElement> & {
  tags: Partial<ITag>[];
  is_deletable?: boolean;
  is_editable?: boolean;
  onTagsChange?: (tags: string[]) => void;
  onTagClick?: (tag: Partial<ITag>) => void;
  onTagDelete?: (id: ITag['ID']) => void;
};

export const Tags: FC<IProps> = ({
  tags,
  is_deletable,
  is_editable,
  onTagsChange,
  onTagClick,
  onTagDelete,
  ...props
}) => {
  const [data, setData] = useState<string[]>([]);

  const [catTags, ordinaryTags] = useMemo(() => separateTags(tags), [tags]);

  const onSubmit = useCallback(
    (last: string[]) => {
      if (!onTagsChange) {
        return;
      }

      const exist = tags.map(tag => tag.title);
      const uniqueTags = uniq([...exist, ...data, ...last]).filter(el => el) as string[];

      if (uniqueTags.length === exist.length) {
        return;
      }

      onTagsChange(uniqueTags);
      setData([]);
    },
    [data, onTagsChange, tags]
  );

  const onAppendTag = useCallback(
    (created: string[]) => {
      setData(
        uniq([...data, ...created]).filter(
          title => !tags.some(it => it.title?.trim() === title?.trim())
        )
      );
    },
    [data, setData, tags]
  );

  const onClearTag = useCallback((): string | undefined => {
    if (!data.length) return;
    const last = data[data.length - 1];
    setData(data.slice(0, data.length - 1));
    return last;
  }, [data, setData]);

  const exclude = useMemo(
    () => [...(data || []), ...(tags || []).filter(el => el.title).map(({ title }) => title!)],
    [data, tags]
  );

  return (
    <TagField {...props}>
      {catTags.map(tag => (
        <Tag
          key={tag.title}
          tag={tag}
          onClick={onTagClick}
          is_deletable={is_deletable}
          onDelete={onTagDelete}
        />
      ))}

      {ordinaryTags.map(tag => (
        <Tag
          key={tag.title}
          tag={tag}
          onClick={onTagClick}
          is_deletable={is_deletable}
          onDelete={onTagDelete}
        />
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
