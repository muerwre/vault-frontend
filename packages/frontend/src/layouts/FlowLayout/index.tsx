import { useEffect, useState } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { FlowGrid } from '~/containers/flow/FlowGrid';
import { FlowLoginStamp } from '~/containers/flow/FlowLoginStamp';
import { FlowStamp } from '~/containers/flow/FlowStamp';
import { FlowSwiperHero } from '~/containers/flow/FlowSwiperHero';
import { SubmitBarRouter } from '~/containers/main/SubmitBarRouter';
import { useAuth } from '~/hooks/auth/useAuth';
import { useInfiniteLoader } from '~/hooks/dom/useInfiniteLoader';
import { useFlowContext } from '~/utils/providers/FlowProvider';

import styles from './styles.module.scss';

const FlowLayout = observer(() => {
  const [showLoginStamp, setShowLoginStamp] = useState(false);

  const { heroes, nodes, onChangeCellView, loadMore, isSyncing } =
    useFlowContext();

  const { user, isUser } = useAuth();

  useInfiniteLoader(loadMore, isSyncing);

  useEffect(() => setShowLoginStamp(!isUser), [isUser]);

  return (
    <div className={classNames(styles.container)}>
      <div className={styles.grid}>
        <div className={styles.hero}>
          <FlowSwiperHero heroes={heroes} />
        </div>

        <div className={styles.stamp}>
          <FlowStamp isFluid={false} onToggleLayout={console.warn} />
        </div>

        {showLoginStamp && (
          <div className={styles.login}>
            <FlowLoginStamp />
          </div>
        )}

        <FlowGrid
          nodes={nodes}
          user={user}
          onChangeCellView={onChangeCellView}
        />
      </div>

      <SubmitBarRouter prefix="" />
    </div>
  );
});

export { FlowLayout };
