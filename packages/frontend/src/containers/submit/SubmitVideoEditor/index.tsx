import { FC, useCallback, useMemo } from 'react';

import { observer } from 'mobx-react-lite';

import { Icon } from '~/components/common/Icon';
import { SortableGrid } from '~/components/sortable/SortableGrid';
import { useYoutubeMetadata } from '~/hooks/metadata/useYoutubeMetadata';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { IBlock } from '~/types';
import { NodeEditorProps } from '~/types/node';
import { getYoutubeId } from '~/utils/dom';

import { SubmitCard } from '../SubmitCard';
import { SubmitEmptyState } from '../SubmitEmptyState';
import { SubmitVideoAddCard } from '../SubmitVideoAddCard';

import styles from './styles.module.scss';

interface Video {
  id: string;
  url: string;
}

interface CardProps {
  item: Video;
  onRemove: (id: string) => void;
}

const SubmitVideoCard: FC<CardProps> = observer(({ item, onRemove }) => {
  const { id } = item;
  const metadata = useYoutubeMetadata(id);
  const title = metadata?.metadata?.title;

  return (
    <SubmitCard className={styles.card}>
      <div
        className={styles.thumb}
        style={{
          backgroundImage: `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`,
        }}
      >
        <button
          type="button"
          className={styles.remove}
          // on mouse down, like photo tiles: a click would start a drag first
          onMouseDown={() => onRemove(id)}
          aria-label="Убрать видео"
        >
          <Icon icon="close" size={20} />
        </button>
      </div>

      <div className={styles.title}>{title || '...'}</div>
    </SubmitCard>
  );
});

const getVideoId = (it: Video) => it.id;
const noLocked: FC = () => null;

/**
 * Video node content: a sortable list of YouTube videos ending in an add card.
 * Before the first one, the add card sits centred in the empty zone.
 */
const SubmitVideoEditor: FC<NodeEditorProps> = () => {
  const { values, setFieldValue } = useNodeFormContext();

  const videos = useMemo<Video[]>(
    () =>
      values.blocks.flatMap((block) => {
        const id = block.type === 'video' && getYoutubeId(block.url);
        return block.type === 'video' && id ? [{ id, url: block.url }] : [];
      }),
    [values.blocks],
  );

  // Videos are written back after the other blocks, which keep their order.
  const setVideos = useCallback(
    (next: Video[]) =>
      setFieldValue('blocks', [
        ...values.blocks.filter(
          (it) => it.type !== 'video' || !getYoutubeId(it.url),
        ),
        ...next.map((it): IBlock => ({ type: 'video', url: it.url })),
      ]),
    [values.blocks, setFieldValue],
  );

  const onAdd = useCallback(
    (blocks: IBlock[]) =>
      setFieldValue('blocks', [...values.blocks, ...blocks]),
    [values.blocks, setFieldValue],
  );

  const ids = useMemo(() => videos.map((it) => it.id), [videos]);

  const remove = useCallback(
    (id: string) => setVideos(videos.filter((it) => it.id !== id)),
    [videos, setVideos],
  );

  const cardProps = useMemo(() => ({ onRemove: remove }), [remove]);

  if (!videos.length) {
    return (
      <SubmitEmptyState title="Давайте начнём!" hint="Добавьте первое видео">
        <SubmitVideoAddCard existing={ids} onAdd={onAdd} variant="inline" />
      </SubmitEmptyState>
    );
  }

  return (
    <SortableGrid
      items={videos}
      locked={[]}
      getID={getVideoId}
      getLockedID={getVideoId}
      renderItem={SubmitVideoCard}
      renderItemProps={cardProps}
      renderLocked={noLocked}
      renderLockedProps={{}}
      onSortEnd={setVideos}
      className={styles.grid}
      trailing={<SubmitVideoAddCard existing={ids} onAdd={onAdd} />}
    />
  );
};

export { SubmitVideoEditor };
