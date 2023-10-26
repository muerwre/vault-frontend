import { FC, useMemo } from 'react';

import { BorisGraphicStats } from '~/components/boris/BorisGraphicStats';
import { StatsRow } from '~/components/common/StatsRow';
import { SubTitle } from '~/components/common/SubTitle';
import { StatBackend } from '~/types/boris';
import { sizeOf } from '~/utils/dom';

import styles from './styles.module.scss';

interface IProps {
  stats: StatBackend;
  isLoading: boolean;
}

const BorisStatsBackend: FC<IProps> = ({ isLoading, stats }) => {
  const commentsByMonth = useMemo(
    () => stats.comments.by_month?.slice(0, -1),
    [stats.comments.by_month],
  );
  const nodesByMonth = useMemo(
    () => stats.nodes.by_month?.slice(0, -1),
    [stats.comments.by_month],
  );

  if (!stats && !isLoading) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <SubTitle isLoading={isLoading} className={styles.title}>
        Юнитс
      </SubTitle>

      <ul>
        <StatsRow isLoading={isLoading} label="В сознании">
          {stats.users.alive}
        </StatsRow>

        <StatsRow isLoading={isLoading} label="Криокамера">
          {stats.users.total - stats.users.alive}
        </StatsRow>
      </ul>

      <SubTitle isLoading={isLoading} className={styles.title}>
        Контент
      </SubTitle>

      <ul>
        <StatsRow isLoading={isLoading} label="Фотографии">
          {stats.nodes.images}
        </StatsRow>

        <StatsRow isLoading={isLoading} label="Письма">
          {stats.nodes.texts}
        </StatsRow>

        <StatsRow isLoading={isLoading} label="Видеозаписи">
          {stats.nodes.videos}
        </StatsRow>

        <StatsRow isLoading={isLoading} label="Аудиозаписи">
          {stats.nodes.audios}
        </StatsRow>

        {/*
          <StatsRow isLoading={isLoading} label="Комментарии">
            {stats.comments.total}
          </StatsRow>
        */}
      </ul>

      <div className={styles.graphs}>
        <BorisGraphicStats
          totalComments={stats.comments.total}
          commentsByMonth={commentsByMonth}
          totalNodes={stats.nodes.total}
          nodesByMonth={nodesByMonth}
        />
      </div>

      <SubTitle isLoading={isLoading} className={styles.title}>
        Сторедж
      </SubTitle>

      <ul>
        <StatsRow isLoading={isLoading} label="Файлы">
          {stats.files.count}
        </StatsRow>

        <StatsRow isLoading={isLoading} label="На диске">
          {sizeOf(stats.files.size)}
        </StatsRow>
      </ul>
    </div>
  );
};

export { BorisStatsBackend };
