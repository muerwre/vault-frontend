import React, { FC, useEffect } from 'react';
import styles from './styles.module.scss';
import { Card } from '~/components/containers/Card';
import { Sticky } from '~/components/containers/Sticky';
import { Container } from '~/containers/main/Container';
import { LabGrid } from '~/containers/lab/LabGrid';
import { useDispatch } from 'react-redux';
import { labGetList, labGetStats } from '~/redux/lab/actions';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Grid } from '~/components/containers/Grid';
import { Group } from '~/components/containers/Group';
import { LabHero } from '~/components/lab/LabHero';
import { LabBanner } from '~/components/lab/LabBanner';
import { LabHead } from '~/components/lab/LabHead';
import { Filler } from '~/components/containers/Filler';
import { LabStats } from '~/containers/lab/LabStats';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectLabList, selectLabListNodes, selectLabStatsLoading } from '~/redux/lab/selectors';

interface IProps {}

const LabLayout: FC<IProps> = () => {
  const { is_loading } = useShallowSelect(selectLabList);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(labGetList());
    dispatch(labGetStats());
  }, [dispatch]);

  return (
    <div>
      <Container>
        <div className={styles.wrap}>
          <Group className={styles.content}>
            <LabHead isLoading={is_loading} />
            <LabGrid />
          </Group>

          <div className={styles.panel}>
            <Sticky>
              <LabStats />
            </Sticky>
          </div>
        </div>
      </Container>
    </div>
  );
};

export { LabLayout };
