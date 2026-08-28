import type { ColumnOptions, ValueTransformer } from 'typeorm';

/**
 * The schema has two column dialects. Mixing them up is the main source of
 * spurious ALTERs in `migration:generate`.
 *
 * **Legacy** (16 tables: `user`, `node`, `comment`, `file`, …):
 * `utf8mb3_unicode_ci`, signed `int(11)` keys, foreign keys, and
 * `datetime NOT NULL DEFAULT current_timestamp()`.
 *
 * **Modern** (`user_notifications`, `node_watch`, `app_notifications`, …):
 * server-default `utf8mb4`, `int(10) unsigned` keys, no foreign keys, and
 * nullable `timestamp` with no default.
 */

/** The legacy tables' charset. */
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
 * Legacy `datetime NOT NULL DEFAULT current_timestamp()`. Precision must stay
 * pinned to 0; TypeORM defaults date columns to `datetime(6)`, which drifts.
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
 * Nullable `timestamp NULL DEFAULT NULL`: the modern tables' date columns, plus
 * some retro-added to legacy tables (`user.deleted_at`, `token.created_at`, …).
 */
export const TIMESTAMP_NULLABLE: ColumnOptions = {
  type: 'timestamp',
  precision: 0,
  nullable: true,
};

/** Modern-dialect `int(10) unsigned` nullable FK/id column. */
export const MODERN_ID_NULLABLE: ColumnOptions = {
  type: 'int',
  unsigned: true,
  nullable: true,
};

/**
 * Modern-dialect nullable `tinyint(1)` boolean.
 *
 * Booleans are raw `tinyint`, never TypeORM's `boolean` type. Never set `length`
 * on these: display width is inexpressible in entity metadata and would compare
 * against `''` forever. Exact widths live in the baseline migration SQL.
 */
export const modernBool = (options: ColumnOptions = {}): ColumnOptions => ({
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
 * JSON blob in a `text` column. Never the native `json` type, which re-serialises
 * and so rewrites stored bytes. Unparseable values fall back instead of throwing
 * so one bad row cannot break a feed.
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
