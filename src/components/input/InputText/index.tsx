import React, {
  FC,
  ChangeEvent,
  useCallback,
  useState, useEffect,
} from 'react';
import * as styles from '~/styles/inputs.scss';
import classNames from 'classnames';
import { Icon } from '~/components/input/Icon';
import { IInputTextProps } from '~/redux/types';
import { LoaderCircle } from '~/components/input/LoaderCircle';

const InputText: FC<IInputTextProps> = ({
  wrapperClassName,
  className = '',
  handler,
  required = false,
  status,
  title,
  error,
  value = '',
  onRef,
  is_loading,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [inner_ref, setInnerRef] = useState();

  const onInput = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => handler(target.value),
    [handler],
  );

  const onFocus = useCallback(() => setFocused(true), [focused]);
  const onBlur = useCallback(() => setFocused(false), [focused]);

  useEffect(() => {
    if (onRef) onRef(inner_ref);
  }, [inner_ref, onRef]);

  return (
    <div className={classNames(
      styles.input_text_wrapper,
      wrapperClassName,
      {
        [styles.required]: required,
        [styles.focused]: focused,
        [styles.has_status]: !!status || !!error,
        [styles.has_value]: !!value,
        [styles.has_error]: !!error,
        [styles.has_loader]: is_loading,
      },
    )}>
      <div className={styles.input}>
        <input
          type="text"
          onChange={onInput}
          className={classNames(styles.input_text, className)}
          onFocus={onFocus}
          onBlur={onBlur}
          value={value || ''}
          ref={setInnerRef}
          {...props}
        />
      </div>

      <div className={styles.status}>
        <div className={classNames(styles.success_icon, { active: status === 'success' })}>
          <Icon icon="check" size={20} />
        </div>
        <div className={classNames(styles.error_icon, { active: status === 'error' || !!error })}>
          <Icon icon="close" size={20} />
        </div>
      </div>

      <div className={styles.loader}>
        <div className={classNames({ active: is_loading })}>
          <LoaderCircle size={20} />
        </div>
      </div>
      {
        title && <div className={styles.title}><span>{title}</span></div>
      }
      {
        error && <div className={styles.error}><span>{error}</span></div>
      }
    </div>
  );
};

export { InputText };
