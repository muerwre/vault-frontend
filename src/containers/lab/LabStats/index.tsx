import { FC } from 'react';

import { Group } from '~/components/common/Group';
import { NodeHorizontalCard } from '~/components/common/NodeHorizontalCard';
import { SubTitle } from '~/components/common/SubTitle';
import { LabHeroes } from '~/containers/lab/LabStats/components/LabHeroes';
import { useLabContext } from '~/utils/context/LabContextProvider';

import { LabFactoryBanner } from './components/LabFactoryBanner';
import { LabTags } from './components/LabTags';
import styles from './styles.module.scss';

interface Props {}

const LabStats: FC<Props> = () => {
  const { isLoadingStats, tags, heroes, updates } = useLabContext();

  return (
    <Group>
      <LabFactoryBanner />

      <div className={styles.card}>
        <Group>
          {(!!tags.length || isLoadingStats) && (
            <SubTitle isLoading={isLoadingStats} className={styles.title}>
              Тэги
            </SubTitle>
          )}

          <div className={styles.tags}>
            <LabTags tags={tags} isLoading={isLoadingStats} />
          </div>

          <div />
          <div />
          <div />

          {updates.length > 0 && (
            <>
              <div className={styles.title}>Новые</div>
              <Group className={styles.updates}>
                {updates.slice(0, 10).map((node) => (
                  <NodeHorizontalCard node={node} key={node.id} hasNew />
                ))}
              </Group>
            </>
          )}

          {(!!heroes.length || isLoadingStats) && (
            <SubTitle isLoading={isLoadingStats} className={styles.title}>
              Важные
            </SubTitle>
          )}

          <div className={styles.heroes}>
            <LabHeroes nodes={heroes} isLoading={isLoadingStats} />
          </div>
        </Group>
      </div>
    </Group>
  );
};

export { LabStats };
