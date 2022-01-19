import React, { FC } from 'react';

import { SubTitle } from '~/components/common/SubTitle';
import { Group } from '~/components/containers/Group';
import { FlowRecentItem } from '~/components/flow/FlowRecentItem';
import { LabBanner } from '~/components/lab/LabBanner';
import { LabHeroes } from '~/components/lab/LabHeroes';
import { LabTags } from '~/components/lab/LabTags';
import { useLabContext } from '~/utils/context/LabContextProvider';

import styles from './styles.module.scss';

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
