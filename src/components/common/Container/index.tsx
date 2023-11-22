import { FC } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

interface Props {
  className?: string;
}

const Container: FC<Props> = ({ className, children }) => (
  <div className={classNames(styles.container, className)}>{children}</div>
);

export { Container };
