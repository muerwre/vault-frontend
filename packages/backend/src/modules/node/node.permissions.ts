import {
  FLOW_NODE_TYPES,
  LAB_NODE_TYPES,
  NODE_PLACEMENT,
  NODE_TYPES,
  ROLES,
  ROLES_CAN_CREATE_NODE,
  type Role,
} from '@vault/common/constants';

import type { Node } from '../../entities/node.entity';

/**
 * Who may do what to a node.
 *
 * Note the shared precondition: editing, liking and commenting require the node
 * to be a *post* — a flow, lab or profile node — which excludes `webm` and
 * `boris`. A type outside the post lists is none of these and is therefore
 * immutable through these endpoints. Heroing is narrower: flow or lab only.
 */

export interface Actor {
  id: number;
  role: Role | string;
}

type Placed = Pick<Node, 'type' | 'placement'>;

export const isFlowType = (node: Placed): boolean =>
  FLOW_NODE_TYPES.includes(node.type) &&
  Number(node.placement) === NODE_PLACEMENT.FLOW;

export const isLabType = (node: Placed): boolean =>
  LAB_NODE_TYPES.includes(node.type) &&
  Number(node.placement) === NODE_PLACEMENT.LAB;

/** Pinned to the author's profile instead of being listed in a feed. */
export const isProfileType = (node: Placed): boolean =>
  FLOW_NODE_TYPES.includes(node.type) &&
  Number(node.placement) === NODE_PLACEMENT.PROFILE;

export const isFlowOrLabType = (node: Placed): boolean =>
  isFlowType(node) || isLabType(node);

/** Any authored post, wherever it is listed. */
export const isPostType = (node: Placed): boolean =>
  isFlowOrLabType(node) || isProfileType(node);

/** Lab posts and Boris are for members: to a guest they do not exist. */
export const isHiddenFromGuests = (node: Placed): boolean =>
  node.type === NODE_TYPES.BORIS || isLabType(node);

/** Guests and the `guest` role cannot author content. */
export const canCreateNode = (actor: Actor): boolean =>
  ROLES_CAN_CREATE_NODE.includes(actor.role as Role);

/** The author or an admin, and only for a post. */
export const canEditNode = (
  node: Pick<Node, 'type' | 'placement' | 'userId'>,
  actor: Actor,
): boolean =>
  isPostType(node) && (actor.role === ROLES.ADMIN || node.userId === actor.id);

/** Boris accepts comments even though it is not a post. */
export const canCommentOn = (node: Placed): boolean =>
  node.type === NODE_TYPES.BORIS || isPostType(node);

/**
 * Admins only, on flow or lab nodes. Flow heroes feed the top carousel, lab
 * heroes the lab's side panel.
 */
export const canHeroNode = (node: Placed, actor: Actor): boolean =>
  actor.role === ROLES.ADMIN && isFlowOrLabType(node);
