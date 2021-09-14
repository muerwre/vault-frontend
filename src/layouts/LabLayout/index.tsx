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

interface IProps {}

enum Layout {
  Fluid = 'fluid',
  Default = 'default',
}

const LabLayout: FC<IProps> = () => {
  const { is_loading } = useShallowSelect(selectLabList);
  const dispatch = useDispatch();
  const [layout, setLayout] = usePersistedState('lab_layout', Layout.Default);

  const isFluid = layout === Layout.Fluid;
  const toggleLayout = useCallback(() => {
    setLayout(isFluid ? Layout.Default : Layout.Fluid);
  }, [setLayout, isFluid]);

  useEffect(() => {
    dispatch(labGetList());
    dispatch(labGetStats());
  }, [dispatch]);

  return (
    <div>
      <div className={classNames(styles.container, { [styles.fluid]: isFluid })}>
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
      </div>

      <SidebarRouter prefix="/lab" isLab />
    </div>
  );
};

export { LabLayout };
