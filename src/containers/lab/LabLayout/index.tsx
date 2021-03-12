import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Card } from '~/components/containers/Card';
import { Sticky } from '~/components/containers/Sticky';
import { Container } from '~/containers/main/Container';
import { LabGrid } from '~/containers/lab/LabGrid';

interface IProps {}

const LabLayout: FC<IProps> = () => (
  <div>
    <Container>
      <div className={styles.wrap}>
        <div className={styles.content}>
          <LabGrid />
        </div>
        <div className={styles.panel}>
          <Sticky>
            <Card>Test</Card>
          </Sticky>
        </div>
      </div>
    </Container>
  </div>
);

export { LabLayout };
