import { FC } from 'react';

import classNames from 'classnames';
import LazyLoad from 'react-lazyload';

import { IMGProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends IMGProps {
  height?: number;
}

const FlowCellImageLazyLoad: FC<Props> = ({ className, children, ...rest }) => (
  <LazyLoad once offset={600} className={classNames(styles.wrapper, className)}>
    <img {...rest} src={rest.src} alt="" />
    {children}
  </LazyLoad>
);

export { FlowCellImageLazyLoad };
