import React, { FC, useCallback, useEffect } from 'react';
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
import { Superpower } from '~/components/boris/Superpower';
import { Toggle } from '~/components/input/Toggle';
import { usePersistedState } from '~/utils/hooks/usePersistedState';
import classNames from 'classnames';
import { useLabPagination } from '~/utils/hooks/lab/useLabPagination';

interface IProps {}

const LabLayout: FC<IProps> = () => {
  const { is_loading } = useShallowSelect(selectLabList);
  const dispatch = useDispatch();

  useLabPagination({ isLoading: is_loading });

  useEffect(() => {
    dispatch(labGetList());
    dispatch(labGetStats());
  }, [dispatch]);

  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.wrap}>
          <Group className={styles.content}>
            <div className={styles.head}>
              <LabHead isLoading={is_loading} />
            </div>

            <LabGrid />
          </Group>

          <div className={styles.panel}>
            <Sticky>
              <LabStats />
            </Sticky>
          </div>
        </div>
      </div>

      <SidebarRouter prefix="/lab" isLab />
    </Container>
  );
};

export { LabLayout };
