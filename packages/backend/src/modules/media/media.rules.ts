import {
  extractMediaRefs,
  MEDIA_SKIP_REASONS,
  MEDIA_VIDEO_STATUSES,
  mediaRefKey,
  type MediaRef,
  type MediaSkipReason,
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

export interface VideoFacts {
  /** Seconds; null when unknown. */
  duration: number | null;
  isLive: boolean;
}

export type VideoDecision =
  | { status: typeof MEDIA_VIDEO_STATUSES.QUEUED }
  | { status: typeof MEDIA_VIDEO_STATUSES.UNAVAILABLE }
  | { status: typeof MEDIA_VIDEO_STATUSES.SKIPPED; reason: MediaSkipReason };

/**
 * Whether a video should be downloaded, from what is known before downloading.
 * `facts` is undefined when the provider does not know the item. An unknown
 * duration is queued: the fetcher checks it again before downloading.
 */
export const decideVideo = (
  facts: VideoFacts | undefined,
  limits: { maxDurationSec: number },
): VideoDecision => {
  if (!facts) {
    return { status: MEDIA_VIDEO_STATUSES.UNAVAILABLE };
  }

  if (facts.isLive) {
    return {
      status: MEDIA_VIDEO_STATUSES.SKIPPED,
      reason: MEDIA_SKIP_REASONS.LIVE,
    };
  }

  if (facts.duration !== null && facts.duration > limits.maxDurationSec) {
    return {
      status: MEDIA_VIDEO_STATUSES.SKIPPED,
      reason: MEDIA_SKIP_REASONS.TOO_LONG,
    };
  }

  return { status: MEDIA_VIDEO_STATUSES.QUEUED };
};
