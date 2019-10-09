import React, {
  FC,
  HTMLAttributes,
  useState,
  useCallback,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  useRef,
} from 'react';
import { TagField } from '~/components/containers/TagField';
import { ITag, INode } from '~/redux/types';
import { Tag } from '~/components/node/Tag';
import uniq from 'ramda/es/uniq';
import { setTimeout } from 'timers';
import length from 'ramda/es/length';
import isEmpty from 'ramda/es/isEmpty';
import symmetricDifference from 'ramda/es/symmetricDifference';

type IProps = HTMLAttributes<HTMLDivElement> & {
  tags: ITag[];
  is_editable?: boolean;
  onTagsChange?: (tags: string[]) => void;
};

export const Tags: FC<IProps> = ({ tags, is_editable, onTagsChange, ...props }) => {
  const [input, setInput] = useState('');
  const [data, setData] = useState(tags);
  const timer = useRef(null);

  const onInput = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      clearTimeout(timer.current);
      setInput(value);
    },
    [setInput, timer]
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

  const onSubmit = useCallback(() => {
    if (length(tags) === length(data) && isEmpty(symmetricDifference(tags, data))) return;

    if (timer.current) clearTimeout(timer.current);

    onTagsChange(data.map(tag => tag.title));
  }, [tags, data, onTagsChange, timer]);

  const onBlur = useCallback(() => {
    clearTimeout(timer.current);
    onSubmit();
  }, [onSubmit, timer]);

  useEffect(() => setData(tags), [tags]);
  useEffect(() => {
    timer.current = setTimeout(() => {
      onSubmit();
    }, 3000);

    return () => {
      clearTimeout(timer.current);
    };
  }, [data, tags]);

  return (
    <TagField {...props}>
      {data.map(tag => (
        <Tag key={tag.title} title={tag.title} feature={tag.feature} />
      ))}

      {is_editable && <Tag title={input} onInput={onInput} onKeyUp={onKeyUp} onBlur={onBlur} />}
    </TagField>
  );
};
