import { Role } from '~/constants/auth';
import { NODE_TYPES } from '~/constants/node';
import { ICommentGroup, INode } from '~/types';
import { IUser } from '~/types/auth';
import { path } from '~/utils/ramda';

export const canEditNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean =>
  path(['role'], user) === Role.Admin ||
  path(['user', 'id'], node) === path(['id'], user);

export const canEditComment = (
  comment?: Partial<ICommentGroup>,
  user?: Partial<IUser>,
): boolean =>
  path(['role'], user) === Role.Admin ||
  path(['user', 'id'], comment) === path(['id'], user);

export const canLikeComment = (
  comment?: Partial<ICommentGroup>,
  user?: Partial<IUser>,
): boolean =>
  Boolean(
    user?.role &&
      user?.id &&
      user?.role !== Role.Guest &&
      user.id !== comment?.user?.id,
  );

export const canLikeNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean => path(['role'], user) !== Role.Guest;

/**
 * Admins star flow photos for the hero carousel. Lab posts never take part,
 * so they get no star.
 */
export const canStarNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean =>
  !!node &&
  !!user &&
  node.type === NODE_TYPES.IMAGE &&
  !!node.is_promoted &&
  user.role === Role.Admin;

/**
 * Drops content the node's type cannot carry, mirroring what the backend
 * keeps: text nodes keep text blocks, video nodes video blocks, photo nodes
 * images, song nodes audio and images. Lets a form that switched types send
 * only what the final type uses. Types not listed are left as they are.
 */
export const pruneNodeContent = (node: INode): INode => {
  switch (node.type) {
    case NODE_TYPES.TEXT:
    case NODE_TYPES.VIDEO: {
      const blockType = node.type === NODE_TYPES.TEXT ? 'text' : 'video';

      return {
        ...node,
        blocks: node.blocks.filter((it) => it.type === blockType),
        files: [],
      };
    }

    case NODE_TYPES.IMAGE:
      return {
        ...node,
        blocks: [],
        files: node.files.filter((it) => it.type === 'image'),
      };

    case NODE_TYPES.AUDIO:
      return {
        ...node,
        blocks: [],
        files: node.files.filter(
          (it) => it.type === 'audio' || it.type === 'image',
        ),
      };

    default:
      return node;
  }
};
