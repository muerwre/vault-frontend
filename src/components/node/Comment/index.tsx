import React, { FC } from 'react';
import { Card } from "~/components/containers/Card";
import * as styles from './styles.scss';

interface IProps {}

const Comment: FC<IProps> = () => (
    <Card className={styles.wrap}>
      <div className={styles.thumb}>
        <div className={styles.thumb_image} />
      </div>

      <div className={styles.text}>
        Lorem Ipsum
      </div>
    </Card>
);

export { Comment };
