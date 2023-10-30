import classNames from 'classnames';

import { FlowGrid } from '~/components/flow/FlowGrid';
import { FlowLoginStamp } from '~/components/flow/FlowLoginStamp';
import { FlowSwiperHero } from '~/components/flow/FlowSwiperHero';
import { FlowStamp } from '~/containers/flow/FlowStamp';
import { SubmitBarRouter } from '~/containers/main/SubmitBarRouter';
import { useAuth } from '~/hooks/auth/useAuth';
import { useInfiniteLoader } from '~/hooks/dom/useInfiniteLoader';
import { useFlowContext } from '~/utils/providers/FlowProvider';

import styles from './styles.module.scss';

const FlowLayout = () => {
  const { heroes, nodes, onChangeCellView, loadMore, isSyncing } =
    useFlowContext();
  const { user, isUser } = useAuth();

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

        {!isUser && (
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
};

export { FlowLayout };
