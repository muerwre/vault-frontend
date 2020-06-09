import React, { FC } from 'react';
import { IBorisState } from '~/redux/boris/reducer';
import styles from './styles.module.scss';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { sizeOf } from '~/utils/dom';

interface IProps {
  stats: IBorisState['stats'];
}

const BorisStatsBackend: FC<IProps> = ({ stats }) => {
  if (stats.is_loading)
    return (
      <>
        <div className={styles.title}>
          <Placeholder width="50%" />
        </div>
      </>
    );

  if (!stats.backend) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.title}>Юнитс</div>

      <ul>
        <li>
          В сознании <span>{stats.backend.users.alive}</span>
        </li>

        <li>
          Криокамера <span>{stats.backend.users.total - stats.backend.users.alive}</span>
        </li>
      </ul>

      <div className={styles.title}>Контент</div>

      <ul>
        <li>
          Фотографии <span>{stats.backend.nodes.images}</span>
        </li>

        <li>
          Письма <span>{stats.backend.nodes.texts}</span>
        </li>

        <li>
          Видеозаписи <span>{stats.backend.nodes.videos}</span>
        </li>

        <li>
          Аудиозаписи <span>{stats.backend.nodes.audios}</span>
        </li>

        <li>
          Комментарии <span>{stats.backend.comments.total}</span>
        </li>
      </ul>

      <div className={styles.title}>Сторедж</div>
      <ul>
        <li>
          Файлы <span>{stats.backend.files.count}</span>
        </li>
        <li>
          На диске <span>{sizeOf(stats.backend.files.size)}</span>
        </li>
      </ul>
    </div>
  );
};

export { BorisStatsBackend };
