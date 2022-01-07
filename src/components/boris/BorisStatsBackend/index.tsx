import React, { FC } from "react";
import { StatBackend } from "~/types/boris";
import styles from "./styles.module.scss";
import { sizeOf } from "~/utils/dom";
import { StatsRow } from "~/components/common/StatsRow";
import { SubTitle } from "~/components/common/SubTitle";

interface IProps {
  stats: StatBackend;
  isLoading: boolean;
}

const BorisStatsBackend: FC<IProps> = ({ isLoading, stats }) => {
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

        <StatsRow isLoading={isLoading} label="Комментарии">
          {stats.comments.total}
        </StatsRow>
      </ul>

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
