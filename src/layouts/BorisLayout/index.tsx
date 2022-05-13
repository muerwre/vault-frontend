import React, { FC, useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';

import { BorisGraphicStats } from '~/components/boris/BorisGraphicStats';
import { BorisSidebar } from '~/components/boris/BorisSidebar';
import { Superpower } from '~/components/boris/Superpower';
import { BasicCurveChart } from '~/components/charts/BasicCurveChart';
import { StatsCard } from '~/components/charts/StatsCard';
import { Card } from '~/components/containers/Card';
import { Filler } from '~/components/containers/Filler';
import { Grid } from '~/components/containers/Grid';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { Sticky } from '~/components/containers/Sticky';
import { Button } from '~/components/input/Button';
import { Dialog } from '~/constants/modal';
import { URLS } from '~/constants/urls';
import { BorisComments } from '~/containers/boris/BorisComments';
import { Container } from '~/containers/main/Container';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { useShowModal } from '~/hooks/modal/useShowModal';
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

const BorisLayout: FC<IProps> = observer(({ title, setIsBetaTester, isTester, stats, isLoadingStats }) => {
  const { isUser } = useAuthProvider();
  const openProfileSidebar = useShowModal(Dialog.ProfileSidebar);
  const { push } = useRouter();

  const commentsByMonth = useMemo(() => stats.backend.comments.by_month?.slice(0, -1), [stats.backend.comments.by_month]);
  const nodesByMonth = useMemo(() => stats.backend.nodes.by_month?.slice(0, -1), [stats.backend.comments.by_month]);

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
            <Group>
              <Superpower>
                <Padder>
                  <Group>
                    <h2>Тестовые фичи</h2>

                    <div>
                      <Button onClick={() => openProfileSidebar({})}>Профиль в сайдбаре</Button>
                    </div>

                    <div>
                      <Button onClick={() => push(URLS.SETTINGS.BASE)}>
                        Профиль на отдельной странице
                      </Button>
                    </div>
                  </Group>
                </Padder>
              </Superpower>

              <BorisGraphicStats
                totalComments={stats.backend.comments.total}
                commentsByMonth={commentsByMonth}
                totalNodes={stats.backend.nodes.total}
                nodesByMonth={nodesByMonth}
              />

              <BorisComments />
            </Group>
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
});

export { BorisLayout };
