import {
  FLOW_NODE_TYPES,
  LAB_NODE_TYPES,
  NODE_TYPES,
  ROLES,
  ROLES_CAN_CREATE_NODE,
  type Role,
} from '@vault/common/constants';

import type { Node } from '../../entities/node.entity';

/**
 * Who may do what to a node.
 *
 * Note the shared precondition: editing, liking and heroing all require the node
 * to be a *flow or lab* node, which excludes `webm` and `boris`. A promoted node
 * counts as flow, an unpromoted one as lab; a type outside both lists is neither
 * and is therefore immutable through these endpoints.
 */

export interface Actor {
  id: number;
  role: Role | string;
}

export const isFlowType = (node: Pick<Node, 'type' | 'isPromoted'>): boolean =>
  FLOW_NODE_TYPES.includes(node.type) && Boolean(node.isPromoted);

export const isLabType = (node: Pick<Node, 'type' | 'isPromoted'>): boolean =>
  LAB_NODE_TYPES.includes(node.type) && !node.isPromoted;

export const isFlowOrLabType = (
  node: Pick<Node, 'type' | 'isPromoted'>,
): boolean => isFlowType(node) || isLabType(node);

/** Guests and the `guest` role cannot author content. */
export const canCreateNode = (actor: Actor): boolean =>
  ROLES_CAN_CREATE_NODE.includes(actor.role as Role);

/** The author or an admin, and only for a flow/lab node. */
export const canEditNode = (
  node: Pick<Node, 'type' | 'isPromoted' | 'userId'>,
  actor: Actor,
): boolean =>
  isFlowOrLabType(node) &&
  (actor.role === ROLES.ADMIN || node.userId === actor.id);

export const canLikeNode = (node: Pick<Node, 'type' | 'isPromoted'>): boolean =>
  isFlowOrLabType(node);

/** Boris accepts comments even though it is neither a flow nor a lab node. */
export const canCommentOn = (
  node: Pick<Node, 'type' | 'isPromoted'>,
): boolean => node.type === NODE_TYPES.BORIS || isFlowOrLabType(node);

/** Admins only. */
export const canHeroNode = (
  node: Pick<Node, 'type' | 'isPromoted'>,
  actor: Actor,
): boolean => actor.role === ROLES.ADMIN && isFlowOrLabType(node);
