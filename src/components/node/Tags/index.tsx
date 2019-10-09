import React, {
  FC,
  HTMLAttributes,
  useState,
  useCallback,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { TagField } from '~/components/containers/TagField';
import { ITag } from '~/redux/types';
import { Tag } from '~/components/node/Tag';
import uniq from 'ramda/es/uniq';

type IProps = HTMLAttributes<HTMLDivElement> & {
  tags: ITag[];
  is_editable?: boolean;
  onTagsChange?: (tags: string[]) => void;
};

export const Tags: FC<IProps> = ({ tags, is_editable, onChange, ...props }) => {
  const [input, setInput] = useState('');
  const [data, setData] = useState(tags);

  const onInput = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      setInput(value);
    },
    [setInput]
  );

  const onKeyUp = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === 'Backspace' && input === '' && data.length) {
        setData(data.slice(0, data.length - 1));
        setInput(data[data.length - 1].title);
      }

      if (key === 'Enter' || key === ',') {
        setData(
          uniq([
            ...data,
            ...input
              .split(',')
              .map((title: string) => title.trim().substr(0, 32))
              .filter(el => el.length > 0)
              .map(title => ({
                title,
              })),
          ])
        );
        setInput('');
      }
    },
    [input, setInput, data, setData]
  );

  useEffect(() => setData(tags), [tags]);

  return (
    <TagField {...props}>
      {data.map(tag => (
        <Tag key={tag.title} title={tag.title} feature={tag.feature} />
      ))}

      {is_editable && <Tag title={input} onInput={onInput} onKeyUp={onKeyUp} />}
    </TagField>
  );
};
