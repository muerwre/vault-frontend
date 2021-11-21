import React, { FC } from 'react';
import styles from './styles.module.scss';
import { LabBanner } from '~/components/lab/LabBanner';
import { Group } from '~/components/containers/Group';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import {
  selectLabStatsHeroes,
  selectLabStatsLoading,
  selectLabStatsTags,
  selectLabUpdatesNodes
} from '~/redux/lab/selectors';
import { LabTags } from '~/components/lab/LabTags';
import { LabHeroes } from '~/components/lab/LabHeroes';
import { FlowRecentItem } from '~/components/flow/FlowRecentItem';
import { SubTitle } from '~/components/common/SubTitle';

interface IProps {}

const LabStats: FC<IProps> = () => {
  const tags = useShallowSelect(selectLabStatsTags);
  const heroes = useShallowSelect(selectLabStatsHeroes);
  const isLoading = useShallowSelect(selectLabStatsLoading);
  const updates = useShallowSelect(selectLabUpdatesNodes);

  return (
    <Group>
      <LabBanner />

      <div className={styles.card}>
        <Group>
          {(!!tags.length || isLoading) && (
            <SubTitle isLoading={isLoading} className={styles.title}>
              Тэги
            </SubTitle>
          )}

          <div className={styles.tags}>
            <LabTags tags={tags} isLoading={isLoading} />
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

          {(!!heroes.length || isLoading) && (
            <SubTitle isLoading={isLoading} className={styles.title}>
              Важные
            </SubTitle>
          )}

          <div className={styles.heroes}>
            <LabHeroes nodes={heroes} isLoading={isLoading} />
          </div>
        </Group>
      </div>
    </Group>
  );
};

export { LabStats };
