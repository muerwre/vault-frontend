import { BORIS_NODE_ID, NODE_TYPES } from '@vault/common/constants';

import type { Node } from '../../entities/node.entity';

import {
  COMMENT_ITEM_TYPES,
  commentItemType,
  isBorisNode,
  shouldAnnounceComment,
  shouldAnnounceNode,
} from './notification.rules';

const node = (extra: Partial<Node> = {}): Node =>
  ({
    id: 1,
    type: NODE_TYPES.IMAGE,
    isPromoted: true,
    isPublic: true,
    ...extra,
  }) as Node;

describe('notification rules', () => {
  describe('isBorisNode', () => {
    it('matches on id, not type', () => {
      expect(isBorisNode(node({ id: BORIS_NODE_ID }))).toBe(true);
      expect(isBorisNode(node({ id: 5, type: NODE_TYPES.BORIS }))).toBe(false);
    });
  });

  describe('shouldAnnounceNode', () => {
    it('announces a public flow node', () => {
      expect(shouldAnnounceNode(node())).toBe(true);
    });

    /** An unpromoted node is a lab node, which is still listed. */
    it('announces a public lab node', () => {
      expect(shouldAnnounceNode(node({ isPromoted: false }))).toBe(true);
    });

    it('stays silent about a non-public node', () => {
      expect(shouldAnnounceNode(node({ isPublic: false }))).toBe(false);
      expect(
        shouldAnnounceNode(node({ isPublic: false, isPromoted: false })),
      ).toBe(false);
    });

    /** Types outside the feeds are listed nowhere, so nobody is told. */
    it('stays silent about unlisted types', () => {
      for (const type of [NODE_TYPES.WEBM, NODE_TYPES.BORIS]) {
        expect(shouldAnnounceNode(node({ type }))).toBe(false);
        expect(shouldAnnounceNode(node({ type, isPromoted: false }))).toBe(
          false,
        );
      }
    });
  });

  describe('shouldAnnounceComment', () => {
    it('announces on flow and lab nodes', () => {
      expect(shouldAnnounceComment(node())).toBe(true);
      expect(shouldAnnounceComment(node({ isPromoted: false }))).toBe(true);
    });

    it('announces on Boris despite it being neither', () => {
      expect(
        shouldAnnounceComment(
          node({ id: BORIS_NODE_ID, type: NODE_TYPES.BORIS }),
        ),
      ).toBe(true);
    });

    /**
     * A `boris`-typed node that is not Boris is commentable but unlisted, so
     * its comments notify nobody.
     */
    it('stays silent on an unlisted node that is not Boris', () => {
      expect(
        shouldAnnounceComment(node({ id: 5, type: NODE_TYPES.BORIS })),
      ).toBe(false);
      expect(shouldAnnounceComment(node({ type: NODE_TYPES.WEBM }))).toBe(
        false,
      );
    });

    /** Visibility is the node author's concern; participants already know it. */
    it('ignores public visibility', () => {
      expect(shouldAnnounceComment(node({ isPublic: false }))).toBe(true);
    });
  });

  describe('commentItemType', () => {
    it('labels Boris comments separately', () => {
      expect(commentItemType(node({ id: BORIS_NODE_ID }))).toBe('boris');
      expect(commentItemType(node({ id: 5 }))).toBe('comment');
    });

    it('covers both comment item types when removing', () => {
      expect([...COMMENT_ITEM_TYPES].sort()).toEqual(['boris', 'comment']);
    });
  });
});
