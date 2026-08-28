import type { ColumnOptions, ValueTransformer } from 'typeorm';

/**
 * Column helpers that pin down the two distinct schema "dialects" present in the
 * live database. Getting these wrong is the main source of spurious ALTERs in
 * `migration:generate`.
 *
 * **Legacy dialect** — the 16 tables originally created by the old TypeORM app
 * (`user`, `node`, `comment`, `file`, …). `utf8mb3 / utf8mb3_unicode_ci`,
 * signed `int(11)` keys, real foreign keys, and
 * `datetime NOT NULL DEFAULT current_timestamp()` timestamps.
 *
 * **GORM dialect** — tables the Go app's AutoMigrate added later
 * (`user_notifications`, `node_watch`, `app_notifications`, …). Server-default
 * `utf8mb4`, `int(10) unsigned` keys, **no** foreign keys, and nullable
 * `timestamp NULL DEFAULT NULL` timestamps with no default.
 */

/** utf8mb3 / utf8mb3_unicode_ci — the legacy tables' charset. */
export const LEGACY_CHARSET = {
  charset: 'utf8mb3',
  collation: 'utf8mb3_unicode_ci',
} as const;

/** Legacy `varchar(255)`. */
export const legacyVarchar = (options: ColumnOptions = {}): ColumnOptions => ({
  type: 'varchar',
  length: 255,
  ...LEGACY_CHARSET,
  ...options,
});

/** Legacy `text`. */
export const legacyText = (options: ColumnOptions = {}): ColumnOptions => ({
  type: 'text',
  ...LEGACY_CHARSET,
  ...options,
});

/**
 * Legacy `datetime NOT NULL DEFAULT current_timestamp()`.
 *
 * The precision is pinned to 0: MariaDB's bare `datetime` is `datetime(0)`,
 * while TypeORM's own default for date columns is `datetime(6)` — which would
 * otherwise show up as a diff on every generate.
 */
export const LEGACY_TIMESTAMP: ColumnOptions = {
  type: 'datetime',
  precision: 0,
  nullable: false,
  default: () => 'CURRENT_TIMESTAMP',
};

/** Legacy nullable `datetime` with no default (e.g. `last_seen`, `deleted_at`). */
export const LEGACY_DATETIME_NULLABLE: ColumnOptions = {
  type: 'datetime',
  precision: 0,
  nullable: true,
};

/**
 * Nullable `timestamp NULL DEFAULT NULL`. Used for the GORM tables' date
 * columns, and for a handful of columns retro-added to legacy tables
 * (`user.deleted_at`, `file.deleted_at`, `token.created_at`, …).
 */
export const TIMESTAMP_NULLABLE: ColumnOptions = {
  type: 'timestamp',
  precision: 0,
  nullable: true,
};

/** GORM-dialect `int(10) unsigned` nullable FK/id column. */
export const GORM_ID_NULLABLE: ColumnOptions = {
  type: 'int',
  unsigned: true,
  nullable: true,
};

/**
 * Booleans are declared as raw `tinyint`, never TypeORM's `boolean` type.
 *
 * The two dialects disagree on display width — legacy tables have `tinyint(4)`,
 * GORM tables `tinyint(1)` — and TypeORM has no way to express that: the `width`
 * option was removed in 1.0, and setting `length` instead would produce a
 * permanent phantom diff, because the MySQL driver only reads a length back from
 * the database for char/varchar/binary types (`withLengthColumnTypes`), so an
 * entity length of `1` would forever compare against `''`.
 *
 * The upshot is that display width is invisible to `migration:generate` and
 * cannot drift. The baseline migration therefore carries the exact widths in raw
 * SQL, while these helpers only need to pin down type, nullability and default.
 */

/** GORM-dialect nullable `tinyint(1)` boolean. */
export const gormBool = (options: ColumnOptions = {}): ColumnOptions => ({
  type: 'tinyint',
  nullable: true,
  ...options,
});

/** Legacy-dialect `tinyint(4) NOT NULL` boolean with an explicit default. */
export const legacyBool = (defaultValue: 0 | 1): ColumnOptions => ({
  type: 'tinyint',
  nullable: false,
  default: defaultValue,
});

/**
 * Stores a JSON blob in a `text` column, byte-compatible with what Go wrote.
 *
 * Deliberately not MySQL's native `json` type: that would re-serialise (and
 * reorder/reformat) the stored bytes. Unparseable values fall back to `null`
 * rather than throwing — a single bad legacy row must not break a whole feed.
 */
export const jsonTransformer = <T>(fallback: T | null = null): ValueTransformer => ({
  to: (value: T | null | undefined): string | null =>
    value === null || value === undefined ? null : JSON.stringify(value),
  from: (value: string | null): T | null => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },
});

/**
 * `files_order` is a comma-joined list of file ids (`"5,3,9"`), **not** JSON, and
 * the column is `NOT NULL` — an empty list must round-trip to `''`, not `null`.
 */
export const filesOrderTransformer: ValueTransformer = {
  to: (value: number[] | null | undefined): string =>
    !value || value.length === 0 ? '' : value.join(','),
  from: (value: string | null): number[] => {
    if (!value) {
      return [];
    }

    return value
      .split(',')
      .map(id => parseInt(id, 10))
      .filter(id => Number.isFinite(id));
  },
};
