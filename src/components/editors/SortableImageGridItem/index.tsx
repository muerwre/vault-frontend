import React from 'react';
import { SortableElement } from 'react-sortable-hoc';

import styles from './styles.module.scss';

const SortableImageGridItem = SortableElement(({ children }) => (
  <div className={styles.item}>{children}</div>
));

export { SortableImageGridItem };
