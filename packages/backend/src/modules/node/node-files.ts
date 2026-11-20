import { FILE_TYPES, type FileType } from '@vault/common/constants';
import { In, Repository } from 'typeorm';

import { File } from '../../entities/file.entity';
import { Node } from '../../entities/node.entity';
import { sortFilesByOrder } from '../../wire/serialize';

/**
 * Every file the listed nodes reference, in one query, keyed by id; only of
 * `types`, when given. Pair with `filesOf` to hand each node its own.
 */
export const loadFilesById = async (
  files: Repository<File>,
  nodes: Node[],
  types?: FileType[],
): Promise<Map<number, File>> => {
  const ids = [...new Set(nodes.flatMap((node) => node.filesOrder ?? []))];

  if (ids.length === 0) {
    return new Map();
  }

  const rows = await files.findBy({
    id: In(ids),
    ...(types ? { type: In(types) } : {}),
  });

  return new Map(rows.map((file) => [file.id, file]));
};

/** A node's files from a `loadFilesById` batch, in its `files_order`. */
export const filesOf = (node: Node, filesById: Map<number, File>): File[] => {
  const order = node.filesOrder ?? [];

  return sortFilesByOrder(
    order.map((id) => filesById.get(id)).filter((f): f is File => !!f),
    order,
  );
};

/**
 * A node's files with only its first `max` songs, as lists preview a song
 * node; photos and the rest are kept. The node's own page gets every song.
 */
export const capSongs = (files: File[], max: number): File[] => {
  let songs = 0;

  return files.filter(
    (file) => file.type !== FILE_TYPES.AUDIO || songs++ < max,
  );
};
