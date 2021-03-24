import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Card } from '~/components/containers/Card';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Group } from '~/components/containers/Group';

interface IProps {}

const LabBanner: FC<IProps> = () => (
  <Card className={styles.wrap}>
    <Group>
      <div className={styles.title}>Лаборатория!</div>

      <Group className={styles.content}>
        <p>
          <strong>
            Всё, что происходит здесь &mdash; всего лишь эксперимент, о котором не узнает никто за
            пределами Убежища.
          </strong>
        </p>

        <p>
          Ловим радиоактивных жуков, приручаем утконосов-вампиров, катаемся на младшем научном
          сотруднике Егоре Порсифоровиче (у него как раз сейчас линька).
        </p>
      </Group>
    </Group>
  </Card>
);

export { LabBanner };
