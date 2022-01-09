import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { Container } from '~/containers/main/Container';
import { BorisComments } from '~/containers/boris/BorisComments';
import { Card } from '~/components/containers/Card';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { BorisSidebar } from '~/components/boris/BorisSidebar';
import { BorisUsageStats } from '~/types/boris';
import { Tabs } from '~/components/dialogs/Tabs';
import { Superpower } from '~/components/boris/Superpower';
import { BorisUIDemo } from '~/components/boris/BorisUIDemo';

import boris from '~/sprites/boris_robot.svg';
import { useAuthProvider } from '~/utils/providers/AuthProvider';
import { Sticky } from '~/components/containers/Sticky';

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

          <img src={boris} alt="Борис" />
        </div>

        <div className={styles.container}>
          <Card className={styles.content}>
            <Tabs>
              <Superpower>
                <Tabs.List items={['Комментарии', 'ЮАЙ ПЛЭЙГРАУНД']} />
              </Superpower>

              <Tabs.Content>
                <BorisComments />
                <Superpower>
                  <BorisUIDemo />
                </Superpower>
              </Tabs.Content>
            </Tabs>
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
