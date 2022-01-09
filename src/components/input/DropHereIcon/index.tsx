import React, { FC } from 'react';
import styles from './styles.module.scss';
import { SVGProps } from '~/utils/types';

interface Props extends SVGProps {}

const DropHereIcon: FC<Props> = ({ ...rest }) => (
  <svg viewBox="0 0 24 24" stroke="none" {...rest}>
    <path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z" />

    <path
      d="M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z"
      className={styles.arrow}
    />
  </svg>
);

export { DropHereIcon };
