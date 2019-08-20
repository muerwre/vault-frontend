import React, { FC } from 'react';
import * as styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import { Filler } from '~/components/containers/Filler';
import {Icon} from "~/components/input/Icon";

interface IProps {}

const NodePanel: FC<IProps> = () => (
  <div className={styles.wrap}>
    <Group horizontal className={styles.panel}>
      <Filler>
        <div className={styles.title}>Node title</div>
        <div className={styles.name}>~author</div>
      </Filler>
    </Group>

    <div className={styles.buttons}>
      <Icon icon="edit" size={24} />

      <div className={styles.sep} />

      <Icon icon="heart" size={24} />
    </div>
  </div>
);

export { NodePanel };

// <div className={styles.mark} />
