import React, { FC } from 'react';
import { Group } from '~/components/containers/Group';
import { Card } from '~/components/containers/Card';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Filler } from '~/components/containers/Filler';
import styles from './styles.module.scss';
import { Grid } from '~/components/containers/Grid';

interface IProps {}

const LabHead: FC<IProps> = () => (
  <Card className={styles.wrap}>
    <div className={styles.group}>
      <Group horizontal style={{ flex: '0 0 auto' }}>
        <Placeholder width="32px" height={32} />
        <Placeholder width="96px" height={18} />
      </Group>

      <Group horizontal style={{ flex: '0 0 auto' }}>
        <Placeholder width="32px" height={32} />
        <Placeholder width="126px" height={18} />
      </Group>

      <Group horizontal style={{ flex: '0 0 auto' }}>
        <Placeholder width="32px" height={32} />
        <Placeholder width="96px" height={18} />
      </Group>

      <Filler />
    </div>
  </Card>
);

export { LabHead };
