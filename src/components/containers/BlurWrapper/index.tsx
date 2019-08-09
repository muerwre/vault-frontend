import React, { AllHTMLAttributes, FC } from 'react';
import * as styles from './styles.scss';

type IProps = AllHTMLAttributes<HTMLDivElement> & { is_blurred: boolean };

export const BlurWrapper: FC<IProps> = ({ children, is_blurred }) => (
  <div
    className={styles.blur}
    style={{ filter: `blur(${is_blurred ? 15 : 0}px) saturate(${is_blurred ? 1.5 : 1})` }}
  >
    {children}
  </div>
);
