import { In, Repository } from 'typeorm';

import { File } from '../../entities/file.entity';
import { Node } from '../../entities/node.entity';
import { sortFilesByOrder } from '../../wire/serialize';

/**
 * Every file the listed nodes reference, in one query, keyed by id. Pair with
 * `filesOf` to hand each node its own.
 */
export const loadFilesById = async (
  files: Repository<File>,
  nodes: Node[],
): Promise<Map<number, File>> => {
  const ids = [...new Set(nodes.flatMap((node) => node.filesOrder ?? []))];

  if (ids.length === 0) {
    return new Map();
  }

  const rows = await files.findBy({ id: In(ids) });

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
