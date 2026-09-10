import type { Node } from '../../entities/node.entity';

import {
  canCreateNode,
  canEditNode,
  canHeroNode,
  canLikeNode,
  isFlowOrLabType,
  isFlowType,
  isLabType,
} from './node.permissions';

const node = (
  type: string,
  isPromoted: boolean,
  userId: number | null = 7,
): Pick<Node, 'type' | 'isPromoted' | 'userId'> =>
  ({ type, isPromoted, userId }) as Pick<
    Node,
    'type' | 'isPromoted' | 'userId'
  >;

const author = { id: 7, role: 'user' };
const stranger = { id: 8, role: 'user' };
const admin = { id: 9, role: 'admin' };
const guest = { id: 0, role: 'guest' };

describe('node permissions', () => {
  describe('type classification', () => {
    it('treats a promoted flow-listed type as flow', () => {
      expect(isFlowType(node('image', true))).toBe(true);
      expect(isLabType(node('image', true))).toBe(false);
    });

    it('treats an unpromoted flow-listed type as lab', () => {
      expect(isLabType(node('image', false))).toBe(true);
      expect(isFlowType(node('image', false))).toBe(false);
    });

    /** webm and boris are in neither list, so they are neither flow nor lab. */
    it('classifies webm and boris as neither', () => {
      for (const type of ['webm', 'boris']) {
        expect(isFlowOrLabType(node(type, true))).toBe(false);
        expect(isFlowOrLabType(node(type, false))).toBe(false);
      }
    });

    it('accepts every flow-listed type', () => {
      for (const type of ['image', 'video', 'text', 'audio']) {
        expect(isFlowOrLabType(node(type, true))).toBe(true);
      }
    });
  });

  describe('canCreateNode', () => {
    it('allows users and admins', () => {
      expect(canCreateNode(author)).toBe(true);
      expect(canCreateNode(admin)).toBe(true);
    });

    it('denies guests', () => {
      expect(canCreateNode(guest)).toBe(false);
      expect(canCreateNode({ id: 0, role: 'nonsense' })).toBe(false);
    });
  });

  describe('canEditNode', () => {
    it('allows the author', () => {
      expect(canEditNode(node('image', true), author)).toBe(true);
    });

    it('allows an admin who is not the author', () => {
      expect(canEditNode(node('image', true), admin)).toBe(true);
    });

    it('denies a different user', () => {
      expect(canEditNode(node('image', true), stranger)).toBe(false);
    });

    it('denies everyone on a type that is neither flow nor lab', () => {
      expect(canEditNode(node('boris', true), author)).toBe(false);
      expect(canEditNode(node('boris', true), admin)).toBe(false);
    });

    it('denies an author-less node to a non-admin', () => {
      expect(canEditNode(node('image', true, null), stranger)).toBe(false);
      expect(canEditNode(node('image', true, null), admin)).toBe(true);
    });

    it('allows editing a lab node', () => {
      expect(canEditNode(node('image', false), author)).toBe(true);
    });
  });

  describe('canLikeNode', () => {
    it('allows any flow or lab node', () => {
      expect(canLikeNode(node('image', true))).toBe(true);
      expect(canLikeNode(node('text', false))).toBe(true);
    });

    it('denies boris and webm', () => {
      expect(canLikeNode(node('boris', true))).toBe(false);
      expect(canLikeNode(node('webm', true))).toBe(false);
    });
  });

  describe('canHeroNode', () => {
    it('allows only admins', () => {
      expect(canHeroNode(node('image', true), admin)).toBe(true);
      expect(canHeroNode(node('image', true), author)).toBe(false);
      expect(canHeroNode(node('image', true), guest)).toBe(false);
    });

    it('denies admins on a non-flow, non-lab type', () => {
      expect(canHeroNode(node('boris', true), admin)).toBe(false);
    });
  });
});
