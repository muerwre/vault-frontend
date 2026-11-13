import {
  FILE_TYPES,
  MAX_NODE_TITLE_LENGTH,
  NODE_TYPES,
  type NodeType,
} from '@vault/common/constants';
import type { INodeBlock } from '@vault/common/types';

import type { File } from '../../entities/file.entity';

/**
 * Derivation and validation rules for node content. Pure functions: the upsert
 * service applies them, and they are unit-tested directly.
 */

/** Providers whose video URLs yield a thumbnail, and the URL template for each. */
const THUMB_PROVIDERS: ReadonlyArray<{ pattern: RegExp; template: string }> = [
  {
    pattern:
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/,
    template: 'https://i.ytimg.com/vi/%s/hqdefault.jpg',
  },
];

/** Minimum text length for a text node's body to become its description. */
const DESCRIPTION_MIN_LENGTH = 64;

export const getThumbFromUrl = (url: string): string => {
  for (const { pattern, template } of THUMB_PROVIDERS) {
    const match = pattern.exec(url ?? '');

    if (match) {
      return template.replace('%s', match[1]);
    }
  }

  return '';
};

/** Which block types a node of each type may carry. Others carry none. */
export const canHaveBlock = (type: NodeType, block: INodeBlock): boolean => {
  switch (type) {
    case NODE_TYPES.TEXT:
      return block.type === 'text';
    case NODE_TYPES.VIDEO:
      return block.type === 'video';
    default:
      return false;
  }
};

/** A text block needs text; a video block needs a URL a thumbnail can come from. */
export const isBlockValid = (block: INodeBlock): boolean => {
  if (!block) {
    return false;
  }

  if (block.type === 'text') {
    return (block.text ?? '').length > 0;
  }

  if (block.type === 'video') {
    const url = block.url ?? '';
    return url.length > 0 && getThumbFromUrl(url) !== '';
  }

  return false;
};

/** Drops blocks the node type cannot carry, and malformed ones. */
export const filterBlocks = (
  type: NodeType,
  blocks: INodeBlock[] | null | undefined,
): INodeBlock[] =>
  (blocks ?? []).filter(
    (block) => canHaveBlock(type, block) && isBlockValid(block),
  );

/** Which file types a node of each type may carry. */
export const canHaveFile = (type: NodeType, file: File): boolean => {
  switch (type) {
    case NODE_TYPES.IMAGE:
      return file.type === FILE_TYPES.IMAGE;
    case NODE_TYPES.AUDIO:
      return file.type === FILE_TYPES.AUDIO || file.type === FILE_TYPES.IMAGE;
    default:
      return false;
  }
};

export const filterFiles = (type: NodeType, files: File[]): File[] =>
  files.filter((file) => canHaveFile(type, file));

const firstFileOfType = (files: File[], fileType: string): File | undefined =>
  files.find((file) => file.type === fileType);

const firstBlockOfType = (
  blocks: INodeBlock[],
  blockType: string,
): INodeBlock | undefined => blocks.find((block) => block.type === blockType);

/**
 * Content requirements per node type. Returns an error message, or null when the
 * node is publishable.
 *
 * Validated against blocks that have already been filtered for the type, so a
 * requirement a type cannot satisfy would make it uncreatable. Audio therefore
 * requires only an audio file: audio nodes store no blocks at all.
 */
export const validateNodeContent = (
  type: NodeType,
  files: File[],
  blocks: INodeBlock[],
): string | null => {
  switch (type) {
    case NODE_TYPES.IMAGE:
      return firstFileOfType(files, FILE_TYPES.IMAGE)
        ? null
        : 'Прикрепите хотя бы одно изображение';

    case NODE_TYPES.AUDIO:
      return firstFileOfType(files, FILE_TYPES.AUDIO)
        ? null
        : 'Прикрепите хотя бы один аудиофайл';

    case NODE_TYPES.TEXT:
      return firstBlockOfType(blocks, 'text')
        ? null
        : 'В тексте должен быть текст';

    case NODE_TYPES.VIDEO:
      return firstBlockOfType(blocks, 'video')
        ? null
        : 'Прикрепите хотя бы одно видео';

    default:
      return 'Неверные данные для этого типа поста';
  }
};

/** Titles are truncated, not rejected. */
export const truncateTitle = (title: string): string =>
  (title ?? '').slice(0, MAX_NODE_TITLE_LENGTH);

/**
 * A text node's description is its first text block, but only once that block is
 * long enough to be worth showing. Other types keep whatever they had.
 */
export const deriveDescription = (
  type: NodeType,
  blocks: INodeBlock[],
  current: string,
): string => {
  if (type !== NODE_TYPES.TEXT) {
    return current;
  }

  const block = firstBlockOfType(blocks, 'text');
  const text = block && block.type === 'text' ? block.text : '';

  return text.length > DESCRIPTION_MIN_LENGTH ? text : current;
};

/**
 * Image and audio nodes take their thumbnail from the first attached image;
 * video nodes from the first video block's URL. Anything else keeps its own.
 */
export const deriveThumbnail = (
  type: NodeType,
  files: File[],
  blocks: INodeBlock[],
  current: string,
): string => {
  if (type === NODE_TYPES.IMAGE || type === NODE_TYPES.AUDIO) {
    const image = firstFileOfType(files, FILE_TYPES.IMAGE);

    return image ? image.url : current;
  }

  if (type === NODE_TYPES.VIDEO) {
    const block = firstBlockOfType(blocks, 'video');
    const url =
      block && block.type === 'video' ? getThumbFromUrl(block.url) : '';

    return url || current;
  }

  return current;
};

/** Carries the first attached image's dominant colour onto the flow settings. */
export const deriveDominantColor = (
  type: NodeType,
  files: File[],
  current: string,
): string => {
  if (type !== NODE_TYPES.IMAGE && type !== NODE_TYPES.AUDIO) {
    return current;
  }

  const image = firstFileOfType(files, FILE_TYPES.IMAGE);

  return image?.metadata?.dominant_color || current;
};
