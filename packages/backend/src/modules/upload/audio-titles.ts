import { FILE_TYPES } from '@vault/common/constants';
import type { FileMetadata } from '@vault/common/types';
import { In, type Repository } from 'typeorm';

import type { File } from '../../entities/file.entity';

/** The part of a client-sent file object that may change a stored file. */
export interface IncomingFile {
  id?: number;
  metadata?: { title?: unknown } | null;
}

/**
 * Audio files carry a user-editable track title in their metadata. When a node
 * or comment is saved, a changed title on one of its audio files is persisted.
 * Nothing else in a client-supplied file object is trusted.
 */
export const applyAudioTitles = async (
  files: Repository<File>,
  incoming: IncomingFile[] | undefined,
  attached: File[],
): Promise<void> => {
  const byId = new Map(attached.map((file) => [file.id, file]));

  for (const sent of incoming ?? []) {
    const id = Number(sent?.id ?? 0);
    const file = byId.get(id);
    const title = sent?.metadata?.title;

    if (
      !file ||
      file.type !== FILE_TYPES.AUDIO ||
      typeof title !== 'string' ||
      title === file.metadata?.title
    ) {
      continue;
    }

    await files.update(id, {
      metadata: { ...(file.metadata ?? {}), title } as FileMetadata,
    });
  }
};

/** Points files at what now holds them; ids in `released` are let go. */
export const setFilesTarget = async (
  files: Repository<File>,
  claimed: number[],
  target: string,
  released: number[] = [],
): Promise<void> => {
  const lost = released.filter((id) => !claimed.includes(id));

  if (claimed.length > 0) {
    await files.update({ id: In(claimed) }, { target: target as never });
  }

  if (lost.length > 0) {
    await files.update({ id: In(lost) }, { target: null as never });
  }
};
