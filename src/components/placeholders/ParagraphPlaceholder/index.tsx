import React, { FC } from 'react';
import { Placeholder } from '~/components/placeholders/Placeholder';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';

const ParagraphPlaceholder = ({}) => (
  <Group>
    <div className={styles.para}>
      <Placeholder width="120px" />
      <Placeholder width="60px" />
      <Placeholder width="30px" />
      <Placeholder width="70px" />
      <Placeholder width="160px" />
      <Placeholder width="30px" />
    </div>

    <div className={styles.para}>
      <Placeholder width="40px" />
      <Placeholder width="30px" />
      <Placeholder width="120px" />
      <Placeholder width="70px" />
      <Placeholder width="160px" />
      <Placeholder width="30px" />
    </div>
  </Group>
);

export { ParagraphPlaceholder };
