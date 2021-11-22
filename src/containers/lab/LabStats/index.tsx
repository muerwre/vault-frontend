import React, { FC } from 'react';
import styles from './styles.module.scss';
import { LabBanner } from '~/components/lab/LabBanner';
import { Group } from '~/components/containers/Group';
import { LabTags } from '~/components/lab/LabTags';
import { LabHeroes } from '~/components/lab/LabHeroes';
import { FlowRecentItem } from '~/components/flow/FlowRecentItem';
import { SubTitle } from '~/components/common/SubTitle';
import { useLabContext } from '~/utils/context/LabContextProvider';

interface IProps {}

const LabStats: FC<IProps> = () => {
  const { isLoadingStats, tags, heroes, updates } = useLabContext();

  return (
    <Group>
      <LabBanner />

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
                {updates.slice(0, 10).map(node => (
                  <FlowRecentItem node={node} key={node.id} has_new />
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
