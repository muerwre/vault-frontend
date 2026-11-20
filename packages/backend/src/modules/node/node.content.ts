import {
  FILE_TYPES,
  IMAGE_BLOCK_MODES,
  MAX_BLOCK_FILES,
  MAX_NODE_TITLE_LENGTH,
  MIN_TEXT_NODE_LENGTH,
  NODE_LAYOUTS,
  NODE_TYPES,
  type NodeType,
  TEXT_NODE_LIMITS,
} from '@vault/common/constants';
import {
  MEDIA_PROVIDERS,
  type MediaProvider,
  parseMediaUrl,
} from '@vault/common/media';
import type { INodeBlock, INodeSettings } from '@vault/common/types';

import type { File } from '../../entities/file.entity';

/**
 * Derivation and validation rules for node content. Pure functions: the upsert
 * service applies them, and they are unit-tested directly.
 */

/** Stored thumbnail url per provider, built from the item id. */
const THUMB_TEMPLATES: Record<MediaProvider, (id: string) => string> = {
  [MEDIA_PROVIDERS.YOUTUBE]: (id) =>
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
};

/** What separates text blocks once they are joined into one text. */
const TEXT_BLOCK_SEPARATOR = '\n\n';

export const getThumbFromUrl = (url: string): string => {
  const ref = parseMediaUrl(url ?? '');

  return ref ? THUMB_TEMPLATES[ref.provider](ref.id) : '';
};

/** Which block types a node of each type may carry. Others carry none. */
export const canHaveBlock = (type: NodeType, block: INodeBlock): boolean => {
  switch (type) {
    case NODE_TYPES.TEXT:
      return TEXT_NODE_BLOCKS.includes(block?.type);
    case NODE_TYPES.VIDEO:
      return block?.type === 'video';
    default:
      return false;
  }
};

const TEXT_NODE_BLOCKS: readonly string[] = [
  'text',
  'video',
  'images',
  'audio',
];

/** The file type each file block holds. */
const BLOCK_FILE_TYPES = {
  images: FILE_TYPES.IMAGE,
  audio: FILE_TYPES.AUDIO,
} as const;

const IMAGE_MODES: readonly string[] = Object.values(IMAGE_BLOCK_MODES);

/** A file block may list ids or whole files, as clients send them back. */
const toFileId = (raw: unknown): number =>
  raw && typeof raw === 'object'
    ? Number((raw as { id?: unknown }).id)
    : Number(raw);

/**
 * The ids of a file block that point at files of the right type among `files`,
 * without repeats, capped at `MAX_BLOCK_FILES`.
 */
const pickBlockFiles = (
  raw: unknown,
  fileType: string,
  files: File[],
): number[] => {
  const usable = new Set(
    files.filter((file) => file.type === fileType).map((file) => file.id),
  );

  const ids = (Array.isArray(raw) ? raw : [])
    .map(toFileId)
    .filter((id) => usable.has(id));

  return [...new Set(ids)].slice(0, MAX_BLOCK_FILES);
};

/**
 * The block as it is stored, or null when it is malformed or empty: a text
 * block needs non-blank text, a video block a URL a thumbnail can come from,
 * and a file block at least one of `files` of its type.
 */
export const normalizeBlock = (
  block: INodeBlock,
  files: File[] = [],
): INodeBlock | null => {
  switch (block?.type) {
    case 'text': {
      const text = typeof block.text === 'string' ? block.text : '';
      return text.trim().length > 0 ? { type: 'text', text } : null;
    }

    case 'video': {
      const url = typeof block.url === 'string' ? block.url : '';
      return url.length > 0 && getThumbFromUrl(url) !== ''
        ? { type: 'video', url }
        : null;
    }

    case 'images': {
      const ids = pickBlockFiles(block.files, BLOCK_FILE_TYPES.images, files);
      const mode = IMAGE_MODES.includes(block.mode)
        ? block.mode
        : IMAGE_BLOCK_MODES.GRID;

      return ids.length > 0 ? { type: 'images', mode, files: ids } : null;
    }

    case 'audio': {
      const ids = pickBlockFiles(block.files, BLOCK_FILE_TYPES.audio, files);
      return ids.length > 0 ? { type: 'audio', files: ids } : null;
    }

    default:
      return null;
  }
};

export const isBlockValid = (block: INodeBlock, files: File[] = []): boolean =>
  normalizeBlock(block, files) !== null;

/**
 * Keeps a text node within `TEXT_NODE_LIMITS`: photos and songs past the
 * limit are cut from the blocks that hold them, videos past it dropped, and a
 * file block left with nothing goes too.
 */
const capTextNodeBlocks = (blocks: INodeBlock[]): INodeBlock[] => {
  const left: Record<keyof typeof TEXT_NODE_LIMITS, number> = {
    ...TEXT_NODE_LIMITS,
  };

  return blocks.flatMap((block): INodeBlock[] => {
    if (block.type === 'video') {
      return left.video-- > 0 ? [block] : [];
    }

    if (block.type === 'images' || block.type === 'audio') {
      const kept = block.files.slice(0, Math.max(left[block.type], 0));
      left[block.type] -= kept.length;

      return kept.length ? [{ ...block, files: kept }] : [];
    }

    return [block];
  });
};

/**
 * Drops blocks the node type cannot carry, and malformed or empty ones; the
 * rest come back in their stored shape. File blocks keep only ids of `files`.
 * A text node is also held to its overall limits.
 */
export const filterBlocks = (
  type: NodeType,
  blocks: INodeBlock[] | null | undefined,
  files: File[] = [],
): INodeBlock[] => {
  const kept = (Array.isArray(blocks) ? blocks : []).flatMap((block) => {
    const normalized = canHaveBlock(type, block)
      ? normalizeBlock(block, files)
      : null;

    return normalized ? [normalized] : [];
  });

  return type === NODE_TYPES.TEXT ? capTextNodeBlocks(kept) : kept;
};

/** Ids of the files a node's blocks show, in the order they first appear. */
export const blockFileIds = (blocks: INodeBlock[]): number[] => {
  const ids = blocks.flatMap((block) =>
    block.type === 'images' || block.type === 'audio' ? block.files : [],
  );

  return [...new Set(ids)];
};

/** Which file types a node of each type may carry. */
export const canHaveFile = (type: NodeType, file: File): boolean => {
  switch (type) {
    case NODE_TYPES.IMAGE:
      return file.type === FILE_TYPES.IMAGE;
    case NODE_TYPES.AUDIO:
    case NODE_TYPES.TEXT:
      return file.type === FILE_TYPES.AUDIO || file.type === FILE_TYPES.IMAGE;
    default:
      return false;
  }
};

export const filterFiles = (type: NodeType, files: File[]): File[] =>
  files.filter((file) => canHaveFile(type, file));

/**
 * The files a node keeps. A text node keeps only those its blocks show, so an
 * upload whose block was removed is released with the rest.
 */
export const keptFiles = (
  type: NodeType,
  files: File[],
  blocks: INodeBlock[],
): File[] => {
  if (type !== NODE_TYPES.TEXT) {
    return files;
  }

  const byId = new Map(files.map((file) => [file.id, file]));

  return blockFileIds(blocks)
    .map((id) => byId.get(id))
    .filter((file): file is File => file !== undefined);
};

const firstFileOfType = (files: File[], fileType: string): File | undefined =>
  files.find((file) => file.type === fileType);

const firstBlockOfType = (
  blocks: INodeBlock[],
  blockType: string,
): INodeBlock | undefined => blocks.find((block) => block.type === blockType);

/**
 * A text block with text. Stored blocks are read as they are, and old ones
 * may be null or lack their text.
 */
const isTextBlock = (
  block: INodeBlock | null | undefined,
): block is Extract<INodeBlock, { type: 'text' }> =>
  block?.type === 'text' && typeof block.text === 'string';

/** The text of all text blocks, trimmed and joined, as one text. */
export const joinTextBlocks = (blocks: INodeBlock[]): string =>
  blocks
    .flatMap((block) => (isTextBlock(block) ? [block.text.trim()] : []))
    .filter(Boolean)
    .join(TEXT_BLOCK_SEPARATOR);

/** Characters of text over all text blocks, without the blanks around each. */
export const textLength = (blocks: INodeBlock[]): number =>
  blocks.reduce(
    (sum, block) => sum + (isTextBlock(block) ? block.text.trim().length : 0),
    0,
  );

/** An edit that leaves a node's existing, non-empty text as it was. */
const keepsShortText = (
  blocks: INodeBlock[],
  stored: INodeBlock[],
): boolean => {
  const text = joinTextBlocks(blocks);

  return text.length > 0 && text === joinTextBlocks(stored);
};

/**
 * Node types whose thumbnail and colour come from their first photo. A text
 * node's photos are those of its photo blocks, in order.
 */
const HAS_IMAGE_THUMBNAIL: readonly NodeType[] = [
  NODE_TYPES.IMAGE,
  NODE_TYPES.AUDIO,
  NODE_TYPES.TEXT,
];

/**
 * Content requirements per node type. Returns an error message, or null when the
 * node is publishable.
 *
 * Validated against blocks that have already been filtered for the type, so a
 * requirement a type cannot satisfy would make it uncreatable. Audio therefore
 * requires only an audio file: audio nodes store no blocks at all. A text node
 * needs `MIN_TEXT_NODE_LENGTH` characters of text over all its text blocks,
 * whatever else it holds. Posts from before that rule keep their shorter text
 * through edits that leave it alone; `stored` is what the node has now.
 */
export const validateNodeContent = (
  type: NodeType,
  files: File[],
  blocks: INodeBlock[],
  stored: INodeBlock[] = [],
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
      return textLength(blocks) >= MIN_TEXT_NODE_LENGTH ||
        keepsShortText(blocks, stored)
        ? null
        : `В посте должно быть хотя бы немного текста`;

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
 * A text node's description is all its text blocks joined. Other types keep
 * whatever they had.
 */
export const deriveDescription = (
  type: NodeType,
  blocks: INodeBlock[],
  current: string,
): string => {
  if (type !== NODE_TYPES.TEXT) {
    return current;
  }

  return joinTextBlocks(blocks) || current;
};

/** Node types that fall back to their cover for a picture. */
const HAS_COVER_FALLBACK: readonly NodeType[] = [
  NODE_TYPES.AUDIO,
  NODE_TYPES.TEXT,
];

/** What a node's thumbnail and colour come from, when anything. */
export interface PictureSources {
  /** The node's cover, which song and text nodes fall back to. */
  cover?: File | null;
  /**
   * Addresses of files this save released. A thumbnail still pointing at one
   * is cleared rather than kept.
   */
  released?: string[];
}

/**
 * The file a node's thumbnail and colour come from: its first photo; for song
 * and text nodes without one, their cover.
 */
const pictureOf = (
  type: NodeType,
  files: File[],
  cover: File | null | undefined,
): File | undefined => {
  if (!HAS_IMAGE_THUMBNAIL.includes(type)) {
    return undefined;
  }

  const image = firstFileOfType(files, FILE_TYPES.IMAGE);

  if (image) {
    return image;
  }

  return cover && HAS_COVER_FALLBACK.includes(type) ? cover : undefined;
};

/**
 * Image, audio and text nodes take their thumbnail from their picture (see
 * `pictureOf`); video nodes from the first video block's URL. A node with
 * nothing to take it from keeps its own, unless that points at a file this
 * save released.
 */
export const deriveThumbnail = (
  type: NodeType,
  files: File[],
  blocks: INodeBlock[],
  current: string,
  { cover, released = [] }: PictureSources = {},
): string => {
  const picture = pictureOf(type, files, cover);

  if (picture) {
    return picture.url;
  }

  if (type === NODE_TYPES.VIDEO) {
    const block = firstBlockOfType(blocks, 'video');
    const url =
      block && block.type === 'video' ? getThumbFromUrl(block.url) : '';

    return url || current;
  }

  return released.includes(current) ? '' : current;
};

/**
 * Carries the picture's dominant colour (see `pictureOf`) onto the flow
 * settings. Without a picture the colour stays, unless the thumbnail it went
 * with was released.
 */
export const deriveDominantColor = (
  type: NodeType,
  files: File[],
  current: string,
  { cover, released = [] }: PictureSources = {},
  thumbnail = '',
): string => {
  if (!HAS_IMAGE_THUMBNAIL.includes(type)) {
    return current;
  }

  const picture = pictureOf(type, files, cover);

  if (picture) {
    return picture.metadata?.dominant_color || current;
  }

  return released.includes(thumbnail) ? '' : current;
};

/**
 * The settings a node keeps, merged from the request over what it has.
 * Aura needs photos to show behind the page, so it only sticks to a song node
 * with at least one image. Defaults and unknown values are dropped, and `null`
 * means nothing is left to store.
 */
export const resolveSettings = (
  type: NodeType,
  files: File[],
  requested: unknown,
  current: INodeSettings | null | undefined,
): INodeSettings | null => {
  const asked =
    requested && typeof requested === 'object'
      ? (requested as Record<string, unknown>)
      : {};

  const layout = 'layout' in asked ? asked.layout : current?.layout;
  const canAura =
    type === NODE_TYPES.AUDIO && !!firstFileOfType(files, FILE_TYPES.IMAGE);

  const settings: INodeSettings = {};

  if (layout === NODE_LAYOUTS.AURA && canAura) {
    settings.layout = NODE_LAYOUTS.AURA;
  }

  return Object.keys(settings).length > 0 ? settings : null;
};
