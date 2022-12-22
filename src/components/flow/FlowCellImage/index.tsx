import React, { FC } from 'react';

import classNames from 'classnames';
import Image from 'next/image';

import { IMGProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends IMGProps {
  height?: number;
}

const FlowCellImage: FC<Props> = ({
  className,
  children,
  src,
  alt,
  ...rest
}) => (
  <div className={classNames(styles.wrapper, className)}>
    <Image
      {...rest}
      src={src!}
      alt={alt}
      placeholder="empty"
      layout="fill"
      objectFit="cover"
    />
    {children}
  </div>
);

export { FlowCellImage };
