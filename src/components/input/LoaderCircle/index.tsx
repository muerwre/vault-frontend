import React, { FC } from 'react';
import styles from './styles.module.scss';
import { describeArc } from '~/utils/dom';
import classNames from 'classnames';
import { LoaderCircleInner } from '~/components/input/LoaderCircleInner';

interface IProps {
  size?: number;
  className?: string;
}

export const LoaderCircle: FC<IProps> = ({ size = 24, className }) => (
  <div className={classNames(styles.wrap, 'loader-circle', className)}>
    <LoaderCircleInner size={size} />
  </div>
);
