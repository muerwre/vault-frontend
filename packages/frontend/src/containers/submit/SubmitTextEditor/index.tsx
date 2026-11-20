import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { useSortableActions } from '~/hooks/sortable/useSortableActions';
import { IBlock } from '~/types';
import { NodeEditorProps } from '~/types/node';
import {
  BlockType,
  createBlock,
  getItemsLeft,
  LimitedBlockType,
  TEXT_NODE_BLOCKS,
} from '~/utils/blocks';

import { SubmitAudioBlock } from './components/SubmitAudioBlock';
import { SubmitBlock } from './components/SubmitBlock';
import { SubmitBlockInserter } from './components/SubmitBlockInserter';
import { SubmitImagesBlock } from './components/SubmitImagesBlock';
import { SubmitTextBlock } from './components/SubmitTextBlock';
import { SubmitVideoBlock } from './components/SubmitVideoBlock';
import styles from './styles.module.scss';
import { BlockEditorProps, BlockUpdater } from './types';

const BLOCK_EDITORS: Record<BlockType, FC<BlockEditorProps<any>>> = {
  text: SubmitTextBlock,
  images: SubmitImagesBlock,
  video: SubmitVideoBlock,
  audio: SubmitAudioBlock,
};

const getKey = (block: IBlock) => block.key ?? '';

/**
 * Text node content: a list of blocks (text, photos, a video, songs) that
 * can be dragged by their handles and removed. A separator before, between
 * and after the blocks inserts new ones there. Empty blocks are dropped on
 * save.
 */
const SubmitTextEditor: FC<NodeEditorProps> = () => {
  const { values, setFieldValue, isSubmitting } = useNodeFormContext();

  const blocks = useMemo(
    () => values.blocks.filter((it) => TEXT_NODE_BLOCKS.includes(it.type)),
    [values.blocks],
  );

  // Formik hands a functional update the last rendered values, so two
  // updates before a render (uploads landing in two blocks at once) would
  // drop one. Each update builds on the one before it instead.
  const latest = useRef(values.blocks);
  latest.current = values.blocks;

  const setBlocks = useCallback(
    (update: (blocks: IBlock[]) => IBlock[]) => {
      latest.current = update(latest.current);
      setFieldValue('blocks', latest.current, false);
    },
    [setFieldValue],
  );

  // Blocks loaded from a post have no keys yet. From here on the form holds
  // only blocks this editor shows, so its indexes match the form's.
  const needsKeys =
    blocks.length !== values.blocks.length || blocks.some((it) => !it.key);

  useEffect(() => {
    if (!needsKeys) {
      return;
    }

    setBlocks((prev) =>
      prev
        .filter((it) => TEXT_NODE_BLOCKS.includes(it.type))
        .map((it) => (it.key ? it : { ...it, key: createBlock(it.type).key })),
    );
  }, [needsKeys, setBlocks]);

  // a new post starts with an empty text block to type into
  useEffect(() => {
    setBlocks((prev) => (prev.length ? prev : [createBlock('text')]));
  }, [setBlocks]);

  const insert = useCallback(
    (index: number, type: BlockType) =>
      setBlocks((prev) => [
        ...prev.slice(0, index),
        createBlock(type),
        ...prev.slice(index),
      ]),
    [setBlocks],
  );

  const remove = useCallback(
    (key: string) => setBlocks((prev) => prev.filter((it) => it.key !== key)),
    [setBlocks],
  );

  const updaters = useMemo(() => {
    const result: Record<string, BlockUpdater> = {};

    blocks.forEach(({ key }) => {
      if (key) {
        result[key] = (update) =>
          setBlocks((prev) =>
            prev.map((it) => (it.key === key ? update(it) : it)),
          );
      }
    });

    return result;
    // keyed by the keys alone, so editors keep their handlers while typing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.map(getKey).join(), setBlocks]);

  // Blocks with uploads running. Their uploads land in the block's own
  // uploader, so a block removed meanwhile would lose them; it stays until
  // they are in.
  const [uploading, setUploading] = useState<string[]>([]);

  const uploadReporters = useMemo(() => {
    const result: Record<string, (busy: boolean) => void> = {};

    blocks.forEach(({ key }) => {
      if (key) {
        result[key] = (busy) =>
          setUploading((prev) => {
            if (busy === prev.includes(key)) {
              return prev;
            }

            return busy ? [...prev, key] : prev.filter((it) => it !== key);
          });
      }
    });

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.map(getKey).join()]);

  const onSortEnd = useCallback(
    (next: IBlock[]) => setBlocks(() => next),
    [setBlocks],
  );

  const { sensors, onDragStart, onDragEnd, draggingItem, ids } =
    useSortableActions(blocks, getKey, onSortEnd);

  const isDragging = !!draggingItem;

  const left = useMemo(() => getItemsLeft(blocks), [blocks]);

  // a block of a kind the post holds its limit of would stay empty
  const full = useMemo(
    () =>
      TEXT_NODE_BLOCKS.filter(
        (type) => type !== 'text' && left[type as LimitedBlockType] <= 0,
      ),
    [left],
  );

  // keys are given right after mount; until then there is nothing to edit
  if (blocks.some((it) => !it.key)) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => onDragEnd({ active: {}, over: null } as never)}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {blocks.map((block, index) => {
            const key = getKey(block);
            const Editor = BLOCK_EDITORS[block.type];

            return (
              <SubmitBlock
                key={key}
                id={key}
                onRemove={() => remove(key)}
                disabled={isSubmitting}
                removeDisabled={uploading.includes(key)}
                removeHint="Дождитесь, пока файлы загрузятся"
                before={
                  <SubmitBlockInserter
                    onInsert={(type) => insert(index, type)}
                    hidden={isDragging}
                    disabled={isSubmitting}
                    full={full}
                  />
                }
              >
                <Editor
                  block={block}
                  onChange={updaters[key]}
                  disabled={isSubmitting}
                  left={block.type === 'text' ? undefined : left[block.type]}
                  onUploading={uploadReporters[key]}
                />
              </SubmitBlock>
            );
          })}
        </SortableContext>
      </DndContext>

      <SubmitBlockInserter
        onInsert={(type) => insert(blocks.length, type)}
        hidden={isDragging}
        disabled={isSubmitting}
        full={full}
      />
    </div>
  );
};

export { SubmitTextEditor };
