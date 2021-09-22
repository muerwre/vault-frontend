import React, { FC } from 'react';
import { IBorisState } from '~/redux/boris/reducer';
import styles from './styles.module.scss';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { sizeOf } from '~/utils/dom';

interface IProps {
  stats: IBorisState['stats'];
}

const Row: FC<{ isLoading: boolean }> = ({ isLoading, children }) => (
  <li>
    {isLoading ? (
      <>
        <Placeholder active={isLoading} loading className={styles.label} />
        <Placeholder active={isLoading} loading className={styles.value} width="24px" />
      </>
    ) : (
      children
    )}
  </li>
);

const BorisStatsBackend: FC<IProps> = ({ stats: { is_loading, backend } }) => {
  // const is_loading = true;

  if (!backend && !is_loading) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.title}>
        <Placeholder active={is_loading} loading>
          Юнитс
        </Placeholder>
      </div>

      <ul>
        <Row isLoading={is_loading}>
          <span className={styles.label}>В сознании</span>
          <span className={styles.value}>{backend.users.alive}</span>
        </Row>

        <Row isLoading={is_loading}>
          <span className={styles.label}>Криокамера</span>
          <span className={styles.value}>{backend.users.total - backend.users.alive}</span>
        </Row>
      </ul>

      <div className={styles.title}>
        <Placeholder active={is_loading} loading>
          Контент
        </Placeholder>
      </div>

      <ul>
        <Row isLoading={is_loading}>
          <span className={styles.label}>Фотографии</span>
          <span className={styles.value}>{backend.nodes.images}</span>
        </Row>

        <Row isLoading={is_loading}>
          <span className={styles.label}>Письма</span>
          <span className={styles.value}>{backend.nodes.texts}</span>
        </Row>

        <Row isLoading={is_loading}>
          <span className={styles.label}>Видеозаписи</span>
          <span className={styles.value}>{backend.nodes.videos}</span>
        </Row>

        <Row isLoading={is_loading}>
          <span className={styles.label}>Аудиозаписи</span>
          <span className={styles.value}>{backend.nodes.audios}</span>
        </Row>

        <Row isLoading={is_loading}>
          <span className={styles.label}>Комментарии</span>
          <span className={styles.value}>{backend.comments.total}</span>
        </Row>
      </ul>

      <div className={styles.title}>
        <Placeholder active={is_loading} loading>
          Сторедж
        </Placeholder>
      </div>

      <ul>
        <Row isLoading={is_loading}>
          <span className={styles.label}>Файлы</span>
          <span className={styles.value}>{backend.files.count}</span>
        </Row>

        <Row isLoading={is_loading}>
          <span className={styles.label}>На диске</span>
          <span className={styles.value}>{sizeOf(backend.files.size)}</span>
        </Row>
      </ul>
    </div>
  );
};

export { BorisStatsBackend };
