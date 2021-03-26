import React, { FC, useEffect } from 'react';
import styles from './styles.module.scss';
import { Sticky } from '~/components/containers/Sticky';
import { Container } from '~/containers/main/Container';
import { LabGrid } from '~/containers/lab/LabGrid';
import { useDispatch } from 'react-redux';
import { labGetList, labGetStats } from '~/redux/lab/actions';
import { Group } from '~/components/containers/Group';
import { LabHead } from '~/components/lab/LabHead';
import { LabStats } from '~/containers/lab/LabStats';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectLabList } from '~/redux/lab/selectors';
import { SidebarRouter } from '~/containers/main/SidebarRouter';

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
      <div className={styles.blur} />
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

      <SidebarRouter prefix="/lab" isLab />
    </div>
  );
};

export { LabLayout };
