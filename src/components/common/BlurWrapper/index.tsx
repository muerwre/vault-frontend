import { AllHTMLAttributes, FC } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

type Props = AllHTMLAttributes<HTMLDivElement> & { is_blurred: boolean };

export const BlurWrapper: FC<Props> = ({ children, is_blurred }) => (
  <div className={classNames(styles.blur, { [styles.is_blurred]: is_blurred })}>
    {children}
  </div>
);
