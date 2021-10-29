import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Card } from '~/components/containers/Card';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Group } from '~/components/containers/Group';
import { Square } from '~/components/containers/Square';

interface IProps {}

const LabBanner: FC<IProps> = () => (
  <Square className={styles.wrap}>
    <Group>
      <div className={styles.title}>Лаборатория!</div>

      <Group className={styles.content}>
        <p>
          <strong>
            Всё, что происходит здесь &mdash; всего лишь эксперимент, о котором не узнает никто за
            пределами Убежища.
          </strong>
        </p>
      </Group>
    </Group>
  </Square>
);

export { LabBanner };
