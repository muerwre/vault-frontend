import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Superpower } from '~/components/common/Superpower';
import { Card } from '~/components/containers/Card';
import { Group } from '~/components/containers/Group';
import { Sticky } from '~/components/containers/Sticky';
import { BorisComments } from '~/containers/boris/BorisComments';
import { BorisSidebar } from '~/containers/boris/BorisSidebar';
import { BorisSuperPowersSSR } from '~/containers/boris/BorisSuperpowers/ssr';
import { Container } from '~/containers/main/Container';
import { SubmitBarRouter } from '~/containers/main/SubmitBarRouter';
import { BorisUsageStats } from '~/types/boris';
import { useAuthProvider } from '~/utils/providers/AuthProvider';

import styles from './styles.module.scss';

type IProps = {
  title: string;
  stats: BorisUsageStats;
  isLoadingStats: boolean;
};

const BorisLayout: FC<IProps> = observer(({ title, stats, isLoadingStats }) => {
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
