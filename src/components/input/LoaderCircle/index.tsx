import React, { FC } from 'react';

import classNames from 'classnames';

import { LoaderCircleInner } from '~/components/input/LoaderCircleInner';
import { SVGProps } from '~/utils/types';

import styles from './styles.module.scss';

interface IProps extends SVGProps {
  size?: number;
  className?: string;
}

export const LoaderCircle: FC<IProps> = ({ size = 24, ...rest }) => (
  <div className={classNames(styles.wrap, 'loader-circle', rest.className)}>
    <LoaderCircleInner {...rest} size={size} />
  </div>
);
