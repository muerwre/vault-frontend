import React, { FC } from 'react';
import { FlowGrid } from '~/components/flow/FlowGrid';
import styles from './styles.module.scss';
import { FlowStamp } from '~/containers/flow/FlowStamp';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import classNames from 'classnames';
import { FlowSwiperHero } from '~/components/flow/FlowSwiperHero';
import { useFlowContext } from '~/utils/context/FlowContextProvider';
import { useUser } from '~/hooks/auth/useUser';
import { useInfiniteLoader } from '~/hooks/dom/useInfiniteLoader';

interface Props {
  isFluid: boolean;
  onToggleLayout: () => void;
}

const FlowLayout: FC<Props> = ({ isFluid, onToggleLayout }) => {
  const { heroes, nodes, onChangeCellView, loadMore, isSyncing } = useFlowContext();
  const { user } = useUser();

  useInfiniteLoader(loadMore, isSyncing);

  return (
    <div className={classNames(styles.container)}>
      <div className={styles.grid}>
        <div className={styles.hero}>
          <FlowSwiperHero heroes={heroes} />
        </div>

        <div className={styles.stamp}>
          <FlowStamp isFluid={isFluid} onToggleLayout={onToggleLayout} />
        </div>

        <FlowGrid nodes={nodes} user={user} onChangeCellView={onChangeCellView} />
      </div>

      <SidebarRouter prefix="" />
    </div>
  );
};

export { FlowLayout };
