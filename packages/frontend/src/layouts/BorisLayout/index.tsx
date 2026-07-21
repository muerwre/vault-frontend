import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Card } from '~/components/common/Card';
import { Container } from '~/components/common/Container';
import { Group } from '~/components/common/Group';
import { Sticky } from '~/components/common/Sticky';
import { Superpower } from '~/components/common/Superpower';
import { BorisComments } from '~/containers/boris/BorisComments';
import { BorisSidebar } from '~/containers/boris/BorisSidebar';
import { BorisSuperPowersSSR } from '~/containers/boris/BorisSuperpowers/ssr';
import { SubmitBarRouter } from '~/containers/main/SubmitBarRouter';
import { BorisUsageStats } from '~/types/boris';
import { useAuthProvider } from '~/utils/providers/AuthProvider';

import styles from './styles.module.scss';

type Props = {
  title: string;
  stats: BorisUsageStats;
  isLoadingStats: boolean;
};

const BorisLayout: FC<Props> = observer(({ title, stats, isLoadingStats }) => {
  const { isUser, isTester } = useAuthProvider();

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
              {isTester && (
                <div>
                  <Superpower>
                    <BorisSuperPowersSSR />
                  </Superpower>
                </div>
              )}

              <BorisComments />
            </Group>
          </Card>

          <Group className={styles.stats}>
            <Sticky>
              <BorisSidebar
                stats={stats}
                isUser={isUser}
                isLoading={isLoadingStats}
              />
            </Sticky>
          </Group>
        </div>
      </div>

      <SubmitBarRouter prefix="/" />
    </Container>
  );
});

export { BorisLayout };
