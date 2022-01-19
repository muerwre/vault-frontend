import React, { FC } from 'react';

import classNames from 'classnames';

import { IMGProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends IMGProps {
  height?: number;
}

const FlowCellImage: FC<Props> = ({ className, children, ...rest }) => (
  <div className={classNames(styles.wrapper, className)}>
    <img {...rest} src={rest.src} alt="" />
    {children}
  </div>
);

export { FlowCellImage };
