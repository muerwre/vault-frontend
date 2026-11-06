import type { DataSource } from 'typeorm';

export type FileType = 'image' | 'audio' | 'video' | 'text';

/**
 * Inserts a file row of the given type and returns its id. Specs create their
 * own files rather than borrowing rows from the seeded database, so they can
 * shape them (deleted, metadata) and run against an empty one. Pass every id to
 * {@link deleteFiles} afterwards.
 */
export const makeFile = async (
  db: DataSource,
  ownerId: number,
  type: FileType,
  {
    deleted = false,
    metadata = {} as Record<string, unknown>,
    target = null as string | null,
  } = {},
): Promise<number> => {
  const name = `spec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  await db.query(
    `INSERT INTO file (name, orig_name, path, full_path, url, size, type, mime, metadata, userId, target, created_at, updated_at, deleted_at)
     VALUES (?, ?, 'uploads/spec', ?, ?, 1, ?, 'application/octet-stream', ?, ?, ?, NOW(), NOW(), ?)`,
    [
      name,
      name,
      `uploads/spec/${name}`,
      `REMOTE_CURRENT://uploads/spec/${name}`,
      type,
      JSON.stringify(metadata),
      ownerId,
      target,
      deleted ? new Date() : null,
    ],
  );

  const [row] = await db.query('SELECT LAST_INSERT_ID() AS id');

  return Number(row.id);
};

/** A file's `target` and parsed `metadata`. */
export const readFile = async (db: DataSource, id: number) => {
  const [row] = await db.query(
    'SELECT target, metadata FROM file WHERE id = ?',
    [id],
  );

  return {
    target: row.target as string | null,
    metadata: JSON.parse(row.metadata ?? '{}') as Record<string, unknown>,
  };
};

/** Removes files made by {@link makeFile}, with their junction rows. */
export const deleteFiles = async (
  db: DataSource,
  ids: number[],
): Promise<void> => {
  for (const id of ids) {
    await db.query('DELETE FROM comment_files_file WHERE fileId = ?', [id]);
    await db.query('DELETE FROM node_files_file WHERE fileId = ?', [id]);
    await db.query('UPDATE node SET coverId = NULL WHERE coverId = ?', [id]);
    await db.query('DELETE FROM file WHERE id = ?', [id]);
  }
};
