import { IMAGE_BLOCK_MODES, TEXT_NODE_LIMITS } from '@vault/common/constants';
import uuid from 'uuid4';

import { IBlock, IFile } from '~/types';
import { getYoutubeId } from '~/utils/dom';

export type BlockType = IBlock['type'];

/** Block types a text node is built of, in the order they are offered. */
export const TEXT_NODE_BLOCKS: BlockType[] = [
  'text',
  'images',
  'video',
  'audio',
];

/** A fresh, empty block of the type, with its editor key. */
export const createBlock = (type: BlockType): IBlock => {
  const key = uuid();

  switch (type) {
    case 'images':
      return { type, mode: IMAGE_BLOCK_MODES.GRID, files: [], key };
    case 'audio':
      return { type, files: [], key };
    case 'video':
      return { type, url: '', key };
    default:
      return { type: 'text', text: '', key };
  }
};

/** A block with nothing in it, which is dropped on save. */
export const isBlockEmpty = (block: IBlock): boolean => {
  switch (block.type) {
    case 'text':
      return !block.text.trim();
    case 'video':
      return !getYoutubeId(block.url);
    case 'images':
    case 'audio':
      return !block.files.length;
    default:
      return true;
  }
};

/** The block as it is sent: without its editor key. */
export const stripBlockKey = ({ key, ...block }: IBlock): IBlock => block;

/** Files shown by the blocks, in order, each once. */
export const getBlockFiles = (blocks: IBlock[]): IFile[] => {
  const seen = new Set<number>();

  return blocks
    .flatMap((block) =>
      block.type === 'images' || block.type === 'audio' ? block.files : [],
    )
    .filter((file) => {
      if (!file || seen.has(file.id)) {
        return false;
      }

      seen.add(file.id);
      return true;
    });
};

/** The first text block's text, which previews a text node. */
export const getFirstText = (blocks: IBlock[] | undefined): string => {
  const block = blocks?.find((it) => it.type === 'text');

  return block?.type === 'text' ? block.text : '';
};

/** Block types a text node holds a limited number of items of. */
export type LimitedBlockType = keyof typeof TEXT_NODE_LIMITS;

/** Photos, songs or videos (one per block) the blocks hold together. */
export const countBlockItems = (
  blocks: IBlock[],
  type: LimitedBlockType,
): number =>
  blocks.reduce((count, block) => {
    if (block.type !== type) {
      return count;
    }

    return count + (block.type === 'video' ? 1 : block.files.length);
  }, 0);

/** How many more of each limited item the blocks may take. */
export const getItemsLeft = (
  blocks: IBlock[],
): Record<LimitedBlockType, number> => ({
  images: TEXT_NODE_LIMITS.images - countBlockItems(blocks, 'images'),
  audio: TEXT_NODE_LIMITS.audio - countBlockItems(blocks, 'audio'),
  video: TEXT_NODE_LIMITS.video - countBlockItems(blocks, 'video'),
});
