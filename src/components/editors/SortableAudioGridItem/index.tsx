import React from 'react';
import { SortableElement } from 'react-sortable-hoc';

import * as styles from './styles.scss';

const SortableAudioGridItem = SortableElement(({ children }) => (
  <div className={styles.item}>{children}</div>
));

export { SortableAudioGridItem };
