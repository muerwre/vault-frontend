import {
  extractMediaRefs,
  mediaRefKey,
  type MediaRef,
} from '@vault/common/media';
import type { INodeBlock } from '@vault/common/types';

/** Items linked from a node's video blocks. Text blocks are not scanned. */
export const refsFromBlocks = (
  blocks: INodeBlock[] | null | undefined,
): MediaRef[] => {
  const found = new Map<string, MediaRef>();

  for (const block of blocks ?? []) {
    if (block?.type !== 'video') {
      continue;
    }

    for (const ref of extractMediaRefs(block.url ?? '')) {
      found.set(mediaRefKey(ref), ref);
    }
  }

  return [...found.values()];
};

/** Items linked from a comment body. */
export const refsFromText = (text: string | null | undefined): MediaRef[] =>
  extractMediaRefs(text ?? '');

/** Which links to add and which to drop to turn `current` into `wanted`. */
export const diffIds = (
  current: readonly number[],
  wanted: readonly number[],
): { added: number[]; removed: number[] } => {
  const have = new Set(current);
  const want = new Set(wanted);

  return {
    added: [...want].filter((id) => !have.has(id)),
    removed: [...have].filter((id) => !want.has(id)),
  };
};

const HOUR_MS = 60 * 60 * 1000;

/** How long a claimed job is held for its fetcher without a progress report. */
export const LEASE_MS = 15 * 60 * 1000;

/**
 * Wait before retrying after the `failures`-th retryable failure: an hour,
 * then a day, then a week for every failure after that.
 */
export const retryDelayMs = (failures: number): number => {
  if (failures <= 1) {
    return HOUR_MS;
  }

  return failures === 2 ? 24 * HOUR_MS : 7 * 24 * HOUR_MS;
};
