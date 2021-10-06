import React, { FC } from 'react';
import { IBorisState } from '~/redux/boris/reducer';
import styles from './styles.module.scss';
import { sizeOf } from '~/utils/dom';
import { StatsRow } from '~/components/common/StatsRow';
import { SubTitle } from '~/components/common/SubTitle';

interface IProps {
  stats: IBorisState['stats'];
}

const BorisStatsBackend: FC<IProps> = ({ stats: { is_loading, backend } }) => {
  if (!backend && !is_loading) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <SubTitle isLoading={is_loading} className={styles.title}>
        Юнитс
      </SubTitle>

      <ul>
        <StatsRow isLoading={is_loading} label="В сознании">
          {backend.users.alive}
        </StatsRow>

        <StatsRow isLoading={is_loading} label="Криокамера">
          {backend.users.total - backend.users.alive}
        </StatsRow>
      </ul>

      <SubTitle isLoading={is_loading} className={styles.title}>
        Контент
      </SubTitle>

      <ul>
        <StatsRow isLoading={is_loading} label="Фотографии">
          {backend.nodes.images}
        </StatsRow>

        <StatsRow isLoading={is_loading} label="Письма">
          {backend.nodes.texts}
        </StatsRow>

        <StatsRow isLoading={is_loading} label="Видеозаписи">
          {backend.nodes.videos}
        </StatsRow>

        <StatsRow isLoading={is_loading} label="Аудиозаписи">
          {backend.nodes.audios}
        </StatsRow>

        <StatsRow isLoading={is_loading} label="Комментарии">
          {backend.comments.total}
        </StatsRow>
      </ul>

      <SubTitle isLoading={is_loading} className={styles.title}>
        Сторедж
      </SubTitle>

      <ul>
        <StatsRow isLoading={is_loading} label="Файлы">
          {backend.files.count}
        </StatsRow>

        <StatsRow isLoading={is_loading} label="На диске">
          {sizeOf(backend.files.size)}
        </StatsRow>
      </ul>
    </div>
  );
};

export { BorisStatsBackend };
