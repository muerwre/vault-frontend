import React, { FC } from 'react';

import classNames from 'classnames';

import { FlowGrid } from '~/components/flow/FlowGrid';
import { FlowSwiperHero } from '~/components/flow/FlowSwiperHero';
import { FlowStamp } from '~/containers/flow/FlowStamp';
import { SubmitBarRouter } from '~/containers/main/SubmitBarRouter';
import { useUser } from '~/hooks/auth/useUser';
import { useInfiniteLoader } from '~/hooks/dom/useInfiniteLoader';
import { useFlowContext } from '~/utils/providers/FlowProvider';

import styles from './styles.module.scss';

interface Props {}

const FlowLayout: FC<Props> = () => {
  const { heroes, nodes, onChangeCellView, loadMore, isSyncing } =
    useFlowContext();
  const { user } = useUser();

  useInfiniteLoader(loadMore, isSyncing);

  return (
    <div className={classNames(styles.container)}>
      <div className={styles.grid}>
        <div className={styles.hero}>
          <FlowSwiperHero heroes={heroes} />
        </div>

        <div className={styles.stamp}>
          <FlowStamp isFluid={false} onToggleLayout={console.warn} />
        </div>

        <FlowGrid
          nodes={nodes}
          user={user}
          onChangeCellView={onChangeCellView}
        />
      </div>

      <SubmitBarRouter prefix="" />
    </div>
  );
};

export { FlowLayout };
