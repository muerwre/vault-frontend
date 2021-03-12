import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Card } from '~/components/containers/Card';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Group } from '~/components/containers/Group';

interface IProps {}

const LabBanner: FC<IProps> = () => (
  <Card className={styles.wrap}>
    <Group>
      <Placeholder height={32} />
      <Placeholder height={18} width="120px" />
      <Placeholder height={18} width="200px" />
      <Placeholder height={18} width="60px" />
      <Placeholder height={18} width="180px" />
      <Placeholder height={18} width="230px" />
    </Group>
  </Card>
);

export { LabBanner };
