import React, { FC } from 'react';

import { Superpower } from '~/components/boris/Superpower';
import { Group } from '~/components/containers/Group';
import { Sticky } from '~/components/containers/Sticky';
import { LabHead } from '~/components/lab/LabHead';
import { LabGrid } from '~/containers/lab/LabGrid';
import { LabStats } from '~/containers/lab/LabStats';
import { Container } from '~/containers/main/Container';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { useLabContext } from '~/utils/context/LabContextProvider';

import styles from './styles.module.scss';

interface IProps {}

const LabLayout: FC<IProps> = () => {
  const { isLoading } = useLabContext();

  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.wrap}>
          <Group className={styles.content}>
            <div className={styles.head}>
              <LabHead isLoading={isLoading} />
            </div>

            <LabGrid />
          </Group>

          <div className={styles.panel}>
            <Sticky>
              <LabStats />
            </Sticky>
          </div>
        </div>
      </div>

      <SidebarRouter prefix="/lab" isLab />
    </Container>
  );
};

export { LabLayout };
