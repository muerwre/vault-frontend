import React, {FC, HTMLAttributes} from 'react';
import { range } from 'ramda';
import * as styles from './styles.scss';
import {Group} from "~/components/containers/Group";

type IProps = HTMLAttributes<HTMLDivElement> & {}

const NodeRelated: FC<IProps> = ({
  title,
}) => (
  <Group className={styles.wrap}>
    <div className={styles.title}>
      <div className={styles.line} />
      <div className={styles.text}>{title}</div>
      <div className={styles.line} />
    </div>
    <div className={styles.grid}>
      {
        range(1,7).map(el => (<div className={styles.item} />))
      }
    </div>
  </Group>
);

export { NodeRelated };
