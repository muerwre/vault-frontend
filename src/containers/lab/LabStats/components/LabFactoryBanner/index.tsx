import { useRef } from 'react';

import classNames from 'classnames';

import { Group } from '~/components/common/Group';

import styles from './styles.module.scss';

const LabFactoryBanner = () => {
  const masked = useRef(Math.random() <= 0.5).current;

  return (
    <div className={classNames(styles.banner, { [styles.masked]: masked })}>
      <Group>
        <div className={styles.title}>Лаборатория!</div>

        <Group className={styles.content}>
          <p>
            <strong>
              Всё, что происходит здесь &mdash; всего лишь эксперимент, о
              котором не узнает никто за пределами Убежища.
            </strong>
          </p>
        </Group>
      </Group>
    </div>
  );
};
export { LabFactoryBanner };
