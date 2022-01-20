import React, { FC } from 'react';

import { BorisSidebar } from '~/components/boris/BorisSidebar';
import { Card } from '~/components/containers/Card';
import { Group } from '~/components/containers/Group';
import { Sticky } from '~/components/containers/Sticky';
import { BorisComments } from '~/containers/boris/BorisComments';
import { Container } from '~/containers/main/Container';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { BorisUsageStats } from '~/types/boris';
import { useAuthProvider } from '~/utils/providers/AuthProvider';

import styles from './styles.module.scss';

type IProps = {
  title: string;
  setIsBetaTester: (val: boolean) => void;
  isTester: boolean;
  stats: BorisUsageStats;
  isLoadingStats: boolean;
};

const BorisLayout: FC<IProps> = ({ title, setIsBetaTester, isTester, stats, isLoadingStats }) => {
  const { isUser } = useAuthProvider();

  return (
    <Container>
      <div className={styles.wrap}>
        <div className={styles.cover} />

        <div className={styles.image}>
          <div className={styles.caption}>
            <div className={styles.caption_text}>{title}</div>
          </div>

          <img src="/images/boris_robot.svg" alt="Борис" />
        </div>

        <div className={styles.container}>
          <Card className={styles.content}>
            <BorisComments />
          </Card>

          <Group className={styles.stats}>
            <Sticky>
              <BorisSidebar
                isTester={isTester}
                stats={stats}
                setBetaTester={setIsBetaTester}
                isUser={isUser}
                isLoading={isLoadingStats}
              />
            </Sticky>
          </Group>
        </div>
      </div>

      <SidebarRouter prefix="/" />
    </Container>
  );
};

export { BorisLayout };
