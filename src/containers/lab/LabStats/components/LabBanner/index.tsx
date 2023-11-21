import { Group } from '~/components/common/Group';

import { LabSquare } from './components/LabSquare';
import styles from './styles.module.scss';

const LabBanner = () => (
  <LabSquare className={styles.wrap}>
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
  </LabSquare>
);

export { LabBanner };
