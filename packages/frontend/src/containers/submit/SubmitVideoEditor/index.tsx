import { FC, KeyboardEvent, useCallback, useMemo, useState } from 'react';

import { observer } from 'mobx-react-lite';

import { Icon } from '~/components/common/Icon';
import { Button } from '~/components/input/Button';
import { Textarea } from '~/components/input/Textarea';
import { SortableGrid } from '~/components/sortable/SortableGrid';
import { useYoutubeMetadata } from '~/hooks/metadata/useYoutubeMetadata';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { IBlock } from '~/types';
import { NodeEditorProps } from '~/types/node';
import { getYoutubeId } from '~/utils/dom';

import { SubmitCard } from '../SubmitCard';

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
 * Video node content: a list of YouTube videos. Links are pasted into the add
 * card, several at once if need be; a video already listed is skipped.
 */
const SubmitVideoEditor: FC<NodeEditorProps> = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

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

  const onUrlChange = useCallback((value: string) => {
    setUrl(value);
    setError('');
  }, []);

  const add = useCallback(() => {
    const links = url
      .split(/\s+/)
      .map((it) => ({ url: it, id: getYoutubeId(it) }))
      .filter((it): it is { url: string; id: string } => !!it.id);

    if (!links.length) {
      setError('Это не похоже на ссылку на ютуб');
      return;
    }

    const seen = new Set(videos.map((it) => it.id));
    const blocks: IBlock[] = [];

    links.forEach((it) => {
      if (seen.has(it.id)) {
        return;
      }

      seen.add(it.id);
      blocks.push({ type: 'video', url: it.url });
    });

    if (!blocks.length) {
      setError('Это видео уже добавлено');
      return;
    }

    setFieldValue('blocks', [...values.blocks, ...blocks]);
    setUrl('');
  }, [url, videos, values.blocks, setFieldValue]);

  const remove = useCallback(
    (id: string) => setVideos(videos.filter((it) => it.id !== id)),
    [videos, setVideos],
  );

  const cardProps = useMemo(() => ({ onRemove: remove }), [remove]);

  // Enter adds the videos instead of a new line; Shift+Enter breaks the line.
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== 'Enter' || event.shiftKey) {
        return;
      }

      event.preventDefault();
      add();
    },
    [add],
  );

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
      trailing={
        <SubmitCard className={styles.add}>
          <div className={styles.field}>
            <Textarea
              value={url}
              handler={onUrlChange}
              onKeyDown={onKeyDown}
              placeholder="Ссылка на ютуб"
              error={error}
              minRows={2}
              className={styles.textarea}
            />
          </div>

          <Button
            type="button"
            onClick={add}
            iconLeft="plus"
            size="small"
            className={styles.button}
          >
            Добавить
          </Button>
        </SubmitCard>
      }
    />
  );
};

export { SubmitVideoEditor };
