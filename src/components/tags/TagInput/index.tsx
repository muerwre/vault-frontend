import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TagAutocomplete } from '~/components/tags/TagAutocomplete';
import { TagWrapper } from '~/components/tags/TagWrapper';
import styles from './styles.module.scss';

const placeholder = 'Добавить';

const prepareInput = (input: string): string[] => {
  return input
    .split(',')
    .map((title: string) =>
      title
        .trim()
        .substr(0, 32)
        .toLowerCase()
    )
    .filter(el => el.length > 0);
};

interface IProps {
  onAppend: (tags: string[]) => void;
  onClearTag: () => string | undefined;
  onSubmit: (last: string[]) => void;
  exclude: string[];
}

const TagInput: FC<IProps> = ({ exclude, onAppend, onClearTag, onSubmit }) => {
  const [focused, setFocused] = useState(false);
  const [input, setInput] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  const onInput = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      if (!value.trim()) {
        setInput(value || '');
        return;
      }

      const items = prepareInput(value);

      if (items.length > 1) {
        onAppend(items.slice(0, items.length - 1));
      }

      setInput(items[items.length - 1] || '');
    },
    [setInput]
  );

  const onKeyDown = useCallback(
    ({ key }) => {
      if (key === 'Escape' && ref.current) {
        setInput('');
        ref.current.blur();
        return;
      }

      if (key === 'Backspace' && input === '') {
        setInput(onClearTag() || '');
        return;
      }

      if (key === ',' || key === 'Comma') {
        const created = prepareInput(input);

        if (created.length) {
          onAppend(created);
        }

        setInput('');
      }
    },
    [input, setInput, onClearTag, onAppend, onSubmit, ref.current, wrapper.current]
  );

  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(
    event => {
      if (wrapper.current.contains(event.target)) {
        ref.current.focus();
        return;
      }

      setFocused(false);

      if (input.trim()) {
        setInput('');
      }

      onSubmit([]);
    },
    [input, onAppend, setInput, onSubmit]
  );

  const onAutocompleteSelect = useCallback(
    (val: string) => {
      onAppend([val]);
      setInput('');
    },
    [onAppend, setInput]
  );

  const feature = useMemo(() => (input?.substr(0, 1) === '/' ? 'green' : ''), [input]);

  useEffect(() => {
    if (!focused) return;

    document.addEventListener('click', onBlur);
    return () => document.removeEventListener('click', onBlur);
  }, [onBlur, focused]);

  return (
    <div className={styles.wrap} ref={wrapper}>
      <TagWrapper title={input || placeholder} has_input={true} feature={feature}>
        <input
          type="text"
          value={input}
          size={1}
          placeholder={placeholder}
          maxLength={24}
          onChange={onInput}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          ref={ref}
        />
      </TagWrapper>

      {onInput && focused && input?.length > 0 && (
        <TagAutocomplete
          exclude={exclude}
          input={ref.current}
          onSelect={onAutocompleteSelect}
          search={input}
        />
      )}
    </div>
  );
};

export { TagInput };
