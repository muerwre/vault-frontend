import { FC } from 'react';

import classNames from 'classnames';

import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends DivProps {}

const LabSquare: FC<Props> = ({ children, ...rest }) => (
  <div className={styles.square}>
    <div {...rest} className={classNames(styles.content, rest.className)}>
      {children}
    </div>
  </div>
);

export { LabSquare };
