import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import boris from '~/sprites/boris_robot.svg';
import { Container } from '~/containers/main/Container';
import StickyBox from 'react-sticky-box/dist/esnext';
import { BorisComments } from '~/containers/boris/BorisComments';
import { Card } from '~/components/containers/Card';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { BorisSidebar } from '~/components/boris/BorisSidebar';
import { useUserContext } from '~/utils/context/UserContextProvider';
import { BorisUsageStats } from '~/redux/boris/reducer';
import { Tabs } from '~/components/dialogs/Tabs';
import { Superpower } from '~/components/boris/Superpower';

type IProps = {
  title: string;
  setIsBetaTester: (val: boolean) => void;
  isTester: boolean;
  stats: BorisUsageStats;
};

const BorisLayout: FC<IProps> = ({ title, setIsBetaTester, isTester, stats }) => {
  const user = useUserContext();

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
            <BorisComments />
          </Card>

          <Group className={styles.stats}>
            <StickyBox className={styles.sticky} offsetTop={72} offsetBottom={10}>
              <BorisSidebar
                isTester={isTester}
                stats={stats}
                setBetaTester={setIsBetaTester}
                user={user}
              />
            </StickyBox>
          </Group>
        </div>
      </div>

      <SidebarRouter prefix="/" />
    </Container>
  );
};

export { BorisLayout };
