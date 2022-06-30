import React, { FC } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

interface DragOverlayItemProps {
  className?: string;
}

const DragOverlayItem: FC<DragOverlayItemProps> = ({ className, children }) => (
  <div className={classNames(styles.overlay, className)}>{children}</div>
);

export { DragOverlayItem };
