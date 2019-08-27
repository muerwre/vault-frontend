import React, {
  ChangeEvent,
  LegacyRef,
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  HTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { getStyle } from '~/utils/dom';
import classNames from 'classnames';

import * as styles from '~/styles/inputs.scss';
import { Icon } from '../Icon';

type IProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  minRows?: number;
  maxRows?: number;
  handler: (value: string) => void;
  required?: boolean;
  status?: 'error' | 'success' | '';
  title?: string;
};

const Textarea = memo<IProps>(
  ({
    value,
    placeholder,
    className,
    minRows = 3,
    maxRows = 30,
    handler,
    required = false,
    title = '',
    status = '',
    ...props
  }) => {
    const [rows, setRows] = useState(minRows || 1);
    const [focused, setFocused] = useState(false);

    const textarea: LegacyRef<HTMLTextAreaElement> = useRef(null);

    const onInput = useCallback(
      ({ target }: ChangeEvent<HTMLTextAreaElement>) => handler(target.value),
      [handler]
    );

    const onFocus = useCallback(() => setFocused(true), [setFocused]);
    const onBlur = useCallback(() => setFocused(false), [setFocused]);

    useLayoutEffect(() => {
      const lineHeight = parseInt(getStyle(textarea.current, 'line-height'), 10) || 15;

      textarea.current.rows = 1; // reset number of rows in textarea

      const paddingTop = parseInt(getStyle(textarea.current, 'padding-top'), 10) || 0;
      const paddingBottom = parseInt(getStyle(textarea.current, 'padding-bottom'), 10) || 0;

      const actualScrollHeight =
        (textarea.current.scrollHeight || 0) - (paddingTop + paddingBottom);

      const rowsCount = Math.round(actualScrollHeight / lineHeight);

      let currentRows = minRows;

      if (rowsCount > maxRows) {
        currentRows = maxRows;
        textarea.current.scrollTop = textarea.current.scrollHeight;
      } else if (rowsCount <= minRows) {
        currentRows = minRows;
      } else {
        currentRows = rowsCount;
      }

      textarea.current.rows = currentRows;

      setRows(currentRows);
    }, [value, minRows, maxRows]);

    return (
      <div
        className={classNames(styles.input_text_wrapper, {
          [styles.required]: required,
          [styles.focused]: focused,
          [styles.has_status]: !!status,
          [styles.has_value]: !!value,
        })}
      >
        <div className={styles.input}>
          <textarea
            rows={rows}
            value={value}
            placeholder={placeholder}
            className={classNames(styles.textarea, className)}
            onChange={onInput}
            ref={textarea}
            onFocus={onFocus}
            onBlur={onBlur}
            {...props}
          />
        </div>

        <div className={styles.status}>
          <div className={classNames({ active: status === 'success' })}>
            <Icon icon="check" size={20} />
          </div>
          <div className={classNames({ active: status === 'error' })}>
            <Icon icon="hide" size={20} />
          </div>
        </div>

        {title && (
          <div className={styles.title}>
            <span>{title}</span>
          </div>
        )}
      </div>
    );
  }
);

export { Textarea };
