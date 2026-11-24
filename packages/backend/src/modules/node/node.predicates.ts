import {
  FLOW_NODE_TYPES,
  LAB_NODE_TYPES,
  NODE_PLACEMENT,
} from '@vault/common/constants';
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

/** Flow nodes plus those pinned to a profile: everything a guest may list. */
export const applyIsPublicNode = <T extends object>(
  query: SelectQueryBuilder<T>,
  alias: string,
): SelectQueryBuilder<T> =>
  query.andWhere(
    `${alias}.deleted_at IS NULL AND ${alias}.is_promoted IN (:...publicPlacements) AND ${alias}.is_public = 1 AND ${alias}.type IN (:...flowTypes)`,
    {
      publicPlacements: [NODE_PLACEMENT.FLOW, NODE_PLACEMENT.PROFILE],
      flowTypes: [...FLOW_NODE_TYPES],
    },
  );

export const applyIsLabNode = <T extends object>(
  query: SelectQueryBuilder<T>,
  alias: string,
): SelectQueryBuilder<T> =>
  query.andWhere(
    `${alias}.deleted_at IS NULL AND ${alias}.is_promoted = 0 AND ${alias}.is_public = 1 AND ${alias}.type IN (:...labTypes)`,
    { labTypes: [...LAB_NODE_TYPES] },
  );

/**
 * Flow and lab, never profile nodes. Deliberately omits `is_public`: authed
 * viewers also see non-public nodes.
 */
export const applyIsFlowOrLabNode = <T extends object>(
  query: SelectQueryBuilder<T>,
  alias: string,
): SelectQueryBuilder<T> =>
  query.andWhere(
    `${alias}.deleted_at IS NULL AND ${alias}.is_promoted IN (:...feedPlacements) AND ${alias}.type IN (:...labTypes)`,
    {
      feedPlacements: [NODE_PLACEMENT.LAB, NODE_PLACEMENT.FLOW],
      labTypes: [...LAB_NODE_TYPES],
    },
  );

/** Any post, wherever it is listed. Omits `is_public` like the above. */
export const applyIsAnyPostNode = <T extends object>(
  query: SelectQueryBuilder<T>,
  alias: string,
): SelectQueryBuilder<T> =>
  query.andWhere(
    `${alias}.deleted_at IS NULL AND ${alias}.type IN (:...labTypes)`,
    { labTypes: [...LAB_NODE_TYPES] },
  );

/**
 * Guests get flow and profile posts; authed viewers get lab posts as well.
 * Used by user profiles and search, which are not feeds.
 */
export const applyVisibleToViewer = <T extends object>(
  query: SelectQueryBuilder<T>,
  alias: string,
  isUser: boolean,
): SelectQueryBuilder<T> =>
  isUser ? applyIsAnyPostNode(query, alias) : applyIsPublicNode(query, alias);
