import React, {
  ChangeEvent,
  LegacyRef,
  memo,
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import autosize from 'autosize';

import * as styles from '~/styles/common/inputs.module.scss';
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
  seamless?: boolean;
};

const Textarea = memo<IProps>(
  ({
    placeholder,
    className,
    minRows = 3,
    maxRows = 30,
    handler,
    required = false,
    title = '',
    status = '',
    seamless,
    value,
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

    useEffect(() => {
      if (!textarea.current) return;

      autosize(textarea.current);

      return () => autosize.destroy(textarea.current);
    }, [textarea.current]);

    return (
      <div
        className={classNames(styles.input_text_wrapper, styles.textarea_wrapper, {
          [styles.required]: required,
          [styles.focused]: focused,
          [styles.has_status]: !!status,
          [styles.has_value]: !!value,
          [styles.seamless]: !!seamless,
        })}
      >
        <div className={styles.input}>
          <textarea
            rows={rows}
            value={value || ''}
            placeholder={placeholder}
            className={classNames(styles.textarea, className)}
            onChange={onInput}
            ref={textarea}
            onFocus={onFocus}
            onBlur={onBlur}
            style={{
              maxHeight: maxRows * 20,
              minHeight: minRows * 20,
            }}
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
