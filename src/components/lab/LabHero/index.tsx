import React, { FC } from 'react';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import styles from './styles.module.scss';

interface IProps {}

const LabHero: FC<IProps> = () => (
  <Group horizontal className={styles.wrap1}>
    <div className={styles.star}>
      <Icon icon="star_full" size={32} />
    </div>

    <Group>
      <Placeholder height={20} />
      <Placeholder height={12} width="100px" />
    </Group>
  </Group>
);

export { LabHero };
