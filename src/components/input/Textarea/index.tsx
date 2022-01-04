import React, {
  ChangeEvent,
  DetailedHTMLProps,
  memo,
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import autosize from 'autosize';
import styles from './styles.module.scss';

import { InputWrapper } from '~/components/input/InputWrapper';

type IProps = DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
> & {
  minRows?: number;
  maxRows?: number;
  error?: string;
  value: string;
  className?: string;
  handler: (value: string) => void;
  title?: string;
};

const Textarea = memo<IProps>(
  ({
    placeholder,
    error,
    minRows = 3,
    maxRows = 30,
    className,
    handler,
    title = '',
    value,
    ...props
  }) => {
    const [focused, setFocused] = useState(false);
    const ref = useRef<HTMLTextAreaElement>(null);

    const onInput = useCallback(
      ({ target }: ChangeEvent<HTMLTextAreaElement>) => handler(target.value),
      [handler]
    );

    const onFocus = useCallback(() => setFocused(true), [setFocused]);
    const onBlur = useCallback(() => setFocused(false), [setFocused]);

    useEffect(() => {
      if (!ref?.current) return;
      autosize(ref.current);
      return () => autosize.destroy(ref.current);
    }, [ref]);

    useEffect(() => {
      if (!ref.current) return;

      autosize.update(ref.current);
    }, [value]);

    return (
      <InputWrapper title={title} error={error} focused={focused} notEmpty={!!value}>
        <textarea
          {...props}
          style={{
            ...props.style,
            minHeight: minRows * 20,
          }}
          value={value || ''}
          placeholder={placeholder}
          className={classNames(styles.textarea, className)}
          onChange={onInput}
          ref={ref}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </InputWrapper>
    );
  }
);

export { Textarea };
