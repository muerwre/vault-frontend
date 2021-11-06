import React, { FC } from 'react';
import LazyLoad from 'react-lazyload';
import { IMGProps } from '~/utils/types';
import styles from './styles.module.scss';
import classNames from 'classnames';

interface Props extends IMGProps {
  height?: number;
}

const FlowCellImage: FC<Props> = ({ className, children, ...rest }) => (
  <LazyLoad once offset={600} className={classNames(styles.wrapper, className)}>
    <img {...rest} src={rest.src} alt="" />
    {children}
  </LazyLoad>
);

export { FlowCellImage };
