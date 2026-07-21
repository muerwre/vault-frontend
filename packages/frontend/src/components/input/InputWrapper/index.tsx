import { FC } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

interface InputWrapperProps {
  title?: string;
  error?: string;
  focused: boolean;
  notEmpty: boolean;
}

const InputWrapper: FC<InputWrapperProps> = ({
  children,
  notEmpty,
  title,
  focused,
  error,
}) => (
  <div
    className={classNames(styles.content, {
      [styles.has_error]: !!error,
      [styles.focused]: focused,
      [styles.not_empty]: notEmpty,
    })}
  >
    {!!title && <div className={styles.title}>{title}</div>}
    {children}
    {!!error && <div className={styles.error}>{error}</div>}
  </div>
);

export { InputWrapper };
