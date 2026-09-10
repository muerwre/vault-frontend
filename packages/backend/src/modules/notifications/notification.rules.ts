import {
  BORIS_NODE_ID,
  NOTIFICATION_ITEM_TYPES,
  type NotificationItemType,
} from '@vault/common/constants';

import type { Node } from '../../entities/node.entity';
import { isFlowOrLabType } from '../node/node.permissions';

/**
 * Who gets told about what. Kept free of I/O so the rules can be read and
 * tested on their own.
 */

/**
 * Boris is one specific node, identified by **id**. A node merely of type
 * `boris` is not it, and generates ordinary comment notifications.
 */
export const isBorisNode = (node: Pick<Node, 'id'>): boolean =>
  node.id === BORIS_NODE_ID;

/**
 * Flow watchers only hear about a node that is actually listed and visible, so
 * a private or unlisted node never reaches anyone else's feed.
 */
export const shouldAnnounceNode = (
  node: Pick<Node, 'type' | 'isPromoted' | 'isPublic'>,
): boolean => Boolean(node.isPublic) && isFlowOrLabType(node);

/** Comments notify only on nodes listed in a feed, plus Boris. */
export const shouldAnnounceComment = (
  node: Pick<Node, 'id' | 'type' | 'isPromoted'>,
): boolean => isFlowOrLabType(node) || isBorisNode(node);

/** Boris comments feed the separate `boris` subscription. */
export const commentItemType = (
  node: Pick<Node, 'id'>,
): NotificationItemType =>
  isBorisNode(node)
    ? NOTIFICATION_ITEM_TYPES.BORIS
    : NOTIFICATION_ITEM_TYPES.COMMENT;

/**
 * Both comment item types point at comment ids, so removing a comment's
 * notifications never needs to know which of the two it produced.
 */
export const COMMENT_ITEM_TYPES: readonly NotificationItemType[] = [
  NOTIFICATION_ITEM_TYPES.COMMENT,
  NOTIFICATION_ITEM_TYPES.BORIS,
];
