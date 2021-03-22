import React, { FC } from 'react';
import styles from './styles.module.scss';
import { LabHeadItem } from '~/components/lab/LabHeadItem';

interface IProps {}

const LabHead: FC<IProps> = () => (
  <div className={styles.wrap}>
    <div className={styles.group}>
      <LabHeadItem icon="recent" active>
        Свежие
      </LabHeadItem>
      <LabHeadItem icon="hot">Популярные</LabHeadItem>
      <LabHeadItem icon="star_full">Важные</LabHeadItem>
    </div>
  </div>
);

export { LabHead };
