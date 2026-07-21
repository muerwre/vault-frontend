import { FC } from 'react';

import { Container } from '~/components/common/Container';
import { Group } from '~/components/common/Group';
import { Sticky } from '~/components/common/Sticky';
import { LabGrid } from '~/containers/lab/LabGrid';
import { LabHead } from '~/containers/lab/LabHead';
import { LabLoading } from '~/containers/lab/LabLoading';
import { LabStats } from '~/containers/lab/LabStats';
import { SubmitBarRouter } from '~/containers/main/SubmitBarRouter';
import { useLabContext } from '~/utils/context/LabContextProvider';

import styles from './styles.module.scss';

interface Props {}

const loader = <LabLoading />;

const LabLayout: FC<Props> = () => {
  const { isLoading } = useLabContext();

  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.wrap}>
          <Group className={styles.content}>
            <div className={styles.head}>
              <LabHead isLoading={isLoading} />
            </div>

            {isLoading ? loader : <LabGrid />}
          </Group>

          <div className={styles.panel}>
            <Sticky>
              <LabStats />
            </Sticky>
          </div>
        </div>
      </div>

      <SubmitBarRouter prefix="/lab" isLab />
    </Container>
  );
};

export { LabLayout };
