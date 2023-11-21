import { FC } from 'react';

import classNames from 'classnames';

import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface IProps extends DivProps {}

const LabSquare: FC<IProps> = ({ children, ...rest }) => (
  <div className={styles.square}>
    <div {...rest} className={classNames(styles.content, rest.className)}>
      {children}
    </div>
  </div>
);

export { LabSquare };
