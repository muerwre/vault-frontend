import React, {
  ChangeEvent,
  FC,
  FocusEventHandler,
  KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
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
}

const TagInput: FC<IProps> = ({ onAppend, onClearTag, onSubmit }) => {
  const [focused, setFocused] = useState(false);
  const [input, setInput] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const onInput = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      if (!value.trim()) {
        setInput(value);
        return;
      }

      const items = prepareInput(value);

      if (items.length > 1) {
        onAppend(items.slice(0, items.length - 1));
      }

      setInput(items[items.length - 1]);
    },
    [setInput]
  );

  const onKeyUp = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === 'Escape' && ref.current) {
        setInput('');
        ref.current.blur();
        return;
      }

      if (key === 'Backspace' && input === '') {
        setInput(onClearTag() || '');
        return;
      }

      if (key === 'Enter' || key === ',' || key === 'Comma') {
        const created = prepareInput(input);

        if (created.length) {
          onAppend(created);
        }

        setInput('');
      }

      if (key === 'Enter' && ref.current) {
        ref.current.blur();
      }
    },
    [input, setInput, onClearTag, onAppend, onSubmit, ref.current]
  );

  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    setFocused(false);

    if (input.trim()) {
      const created = prepareInput(input);
      onAppend(created);
      setInput('');
      onSubmit(created);
    }
  }, [input, onAppend, setInput, onSubmit]);

  const feature = useMemo(() => (input.substr(0, 1) === '/' ? 'green' : ''), [input]);

  return (
    <div className={styles.wrap}>
      {onInput && focused && <TagAutocomplete />}
      <TagWrapper title={input || placeholder} has_input={true} feature={feature}>
        <input
          type="text"
          value={input}
          size={1}
          placeholder={placeholder}
          maxLength={24}
          onChange={onInput}
          onKeyUp={onKeyUp}
          onBlur={onBlur}
          onFocus={onFocus}
          ref={ref}
        />
      </TagWrapper>
    </div>
  );
};

export { TagInput };
