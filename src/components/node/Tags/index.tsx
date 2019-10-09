import React, { FC, HTMLAttributes, useState, useCallback, ChangeEvent } from 'react';
import { TagField } from '~/components/containers/TagField';
import { ITag } from '~/redux/types';
import { Tag } from '~/components/node/Tag';

type IProps = HTMLAttributes<HTMLDivElement> & {
  tags: ITag[];
  is_editable?: boolean;
  onTagsChange?: (tags: string[]) => void;
};

export const Tags: FC<IProps> = ({ tags, is_editable, onChange, ...props }) => {
  const [input, setInput] = useState('asdasdasdasdasdasdasdasdasdasdasasdasdasdasdasdasdasda');

  const onInput = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      setInput(value);
    },
    [setInput]
  );

  return (
    <TagField {...props}>
      {tags.map(tag => (
        <Tag key={tag.title} title={tag.title} feature={tag.feature} />
      ))}

      {is_editable && <Tag title={input} onInput={onInput} />}
    </TagField>
  );
};
