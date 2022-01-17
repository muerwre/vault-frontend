import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { LabSquare } from '~/components/lab/LabSquare';

interface IProps {}

const LabBanner: FC<IProps> = () => (
  <LabSquare className={styles.wrap}>
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
  </LabSquare>
);

export { LabBanner };
