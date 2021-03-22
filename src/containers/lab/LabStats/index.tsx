import React, { FC } from 'react';
import styles from './styles.module.scss';
import { LabBanner } from '~/components/lab/LabBanner';
import { Card } from '~/components/containers/Card';
import { Group } from '~/components/containers/Group';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Filler } from '~/components/containers/Filler';
import { LabHero } from '~/components/lab/LabHero';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import {
  selectLabStatsHeroes,
  selectLabStatsLoading,
  selectLabStatsTags,
} from '~/redux/lab/selectors';
import { LabTags } from '~/components/lab/LabTags';
import { LabHeroes } from '~/components/lab/LabHeroes';

interface IProps {}

const LabStats: FC<IProps> = () => {
  const tags = useShallowSelect(selectLabStatsTags);
  const heroes = useShallowSelect(selectLabStatsHeroes);
  const isLoading = useShallowSelect(selectLabStatsLoading);

  return (
    <Group>
      <LabBanner />

      <Card>
        <Group>
          {isLoading ? (
            <Placeholder height={14} width="100px" />
          ) : (
            <div className={styles.title}>Тэги</div>
          )}

          <div className={styles.tags}>
            <LabTags tags={tags} isLoading={isLoading} />
          </div>

          <div />
          <div />
          <div />

          {isLoading ? (
            <Placeholder height={14} width="100px" />
          ) : (
            <div className={styles.title}>Важные</div>
          )}

          <div className={styles.heroes}>
            <LabHeroes nodes={heroes} isLoading={isLoading} />
          </div>
        </Group>
      </Card>
    </Group>
  );
};

export { LabStats };
