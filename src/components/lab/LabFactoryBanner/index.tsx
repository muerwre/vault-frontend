import React, { FC } from 'react';

import { Group } from '~/components/containers/Group';

import styles from './styles.module.scss';

interface LabFactoryBannerProps {}

const LabFactoryBanner: FC<LabFactoryBannerProps> = () => (
  <div className={styles.banner}>
    <Group>
      <div className={styles.title}>Лаборатория!</div>

      <Group className={styles.content}>
        <p>
          <strong>
            Всё, что происходит здесь &mdash; всего лишь эксперимент, о котором
            не узнает никто за пределами Убежища.
          </strong>
        </p>
      </Group>
    </Group>
  </div>
);

export { LabFactoryBanner };
