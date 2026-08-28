import { FLOW_NODE_TYPES, LAB_NODE_TYPES } from '@vault/common/constants';
import type { SelectQueryBuilder } from 'typeorm';

/** Node visibility predicates. These define what each feed contains. */

export const applyIsFlowNode = <T extends object>(
  query: SelectQueryBuilder<T>,
  alias: string,
): SelectQueryBuilder<T> =>
  query.andWhere(
    `${alias}.deleted_at IS NULL AND ${alias}.is_promoted = 1 AND ${alias}.is_public = 1 AND ${alias}.type IN (:...flowTypes)`,
    { flowTypes: [...FLOW_NODE_TYPES] },
  );

export const applyIsLabNode = <T extends object>(
  query: SelectQueryBuilder<T>,
  alias: string,
): SelectQueryBuilder<T> =>
  query.andWhere(
    `${alias}.deleted_at IS NULL AND ${alias}.is_promoted = 0 AND ${alias}.is_public = 1 AND ${alias}.type IN (:...labTypes)`,
    { labTypes: [...LAB_NODE_TYPES] },
  );

/** Deliberately omits `is_public`: authed viewers also see non-public nodes. */
export const applyIsFlowOrLabNode = <T extends object>(
  query: SelectQueryBuilder<T>,
  alias: string,
): SelectQueryBuilder<T> =>
  query.andWhere(
    `${alias}.deleted_at IS NULL AND ${alias}.type IN (:...labTypes)`,
    { labTypes: [...LAB_NODE_TYPES] },
  );

/** Guests get flow only; authed viewers get flow-or-lab. */
export const applyVisibleToViewer = <T extends object>(
  query: SelectQueryBuilder<T>,
  alias: string,
  isUser: boolean,
): SelectQueryBuilder<T> =>
  isUser ? applyIsFlowOrLabNode(query, alias) : applyIsFlowNode(query, alias);
