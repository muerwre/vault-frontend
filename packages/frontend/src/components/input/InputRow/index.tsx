import { FC, ReactNode } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

interface InputRowProps {
  className?: string;
  input?: ReactNode;
}

const InputRow: FC<InputRowProps> = ({ children, input, className }) => (
  <div className={classNames(styles.row, className)}>
    <div>{children}</div>
    {!!input && <div>{input}</div>}
  </div>
);

export { InputRow };
