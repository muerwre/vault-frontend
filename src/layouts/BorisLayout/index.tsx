import { FC, useMemo } from "react";

import { observer } from "mobx-react-lite";

import { BorisGraphicStats } from "~/components/boris/BorisGraphicStats";
import { Superpower } from "~/components/boris/Superpower";
import { Card } from "~/components/containers/Card";
import { Group } from "~/components/containers/Group";
import { Sticky } from "~/components/containers/Sticky";
import { BorisComments } from "~/containers/boris/BorisComments";
import { BorisSidebar } from "~/containers/boris/BorisSidebar";
import { BorisSuperPowersSSR } from "~/containers/boris/BorisSuperpowers/ssr";
import { Container } from "~/containers/main/Container";
import { SidebarRouter } from "~/containers/main/SidebarRouter";
import { BorisUsageStats } from "~/types/boris";
import { useAuthProvider } from "~/utils/providers/AuthProvider";

import styles from "./styles.module.scss";

type IProps = {
  title: string;
  stats: BorisUsageStats;
  isLoadingStats: boolean;
};

const BorisLayout: FC<IProps> = observer(({ title, stats, isLoadingStats }) => {
  const { isUser } = useAuthProvider();
  const commentsByMonth = useMemo(
    () => stats.backend.comments.by_month?.slice(0, -1),
    [stats.backend.comments.by_month],
  );
  const nodesByMonth = useMemo(
    () => stats.backend.nodes.by_month?.slice(0, -1),
    [stats.backend.comments.by_month],
  );

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
                <BorisSuperPowersSSR />
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
                stats={stats}
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
