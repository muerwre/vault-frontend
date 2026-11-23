import type { SelectQueryBuilder } from 'typeorm';

import {
  applyIsFlowNode,
  applyIsFlowOrLabNode,
  applyIsLabNode,
  applyIsPublicNode,
  applyVisibleToViewer,
} from './node.predicates';

/**
 * Records the SQL and parameters handed to andWhere. These predicates define
 * what each feed contains, so the exact fragments are asserted rather than the
 * behaviour being inferred from a query result.
 */
const mockQuery = () => {
  const calls: Array<{ sql: string; params?: Record<string, unknown> }> = [];
  const builder = {
    calls,
    andWhere(sql: string, params?: Record<string, unknown>) {
      calls.push({ sql, params });
      return this;
    },
  };

  return builder as unknown as SelectQueryBuilder<object> & typeof builder;
};

describe('node predicates', () => {
  describe('applyIsFlowNode', () => {
    it('requires not-deleted, promoted, public and a flow type', () => {
      const query = mockQuery();
      applyIsFlowNode(query, 'node');

      expect(query.calls).toHaveLength(1);
      expect(query.calls[0].sql).toBe(
        'node.deleted_at IS NULL AND node.is_promoted = 1 AND node.is_public = 1 AND node.type IN (:...flowTypes)',
      );
      expect(query.calls[0].params).toEqual({
        flowTypes: ['image', 'video', 'text', 'audio'],
      });
    });

    it('honours the alias', () => {
      const query = mockQuery();
      applyIsFlowNode(query, 'n');

      expect(query.calls[0].sql.startsWith('n.deleted_at IS NULL')).toBe(true);
    });

    it('excludes webm and boris from the flow', () => {
      const query = mockQuery();
      applyIsFlowNode(query, 'node');

      const types = query.calls[0].params?.flowTypes as string[];
      expect(types).not.toContain('webm');
      expect(types).not.toContain('boris');
    });
  });

  describe('applyIsLabNode', () => {
    it('requires not-promoted but still public', () => {
      const query = mockQuery();
      applyIsLabNode(query, 'node');

      expect(query.calls[0].sql).toContain('node.is_promoted = 0');
      expect(query.calls[0].sql).toContain('node.is_public = 1');
    });
  });

  describe('applyIsFlowOrLabNode', () => {
    /** Intentional: authed viewers also see non-public nodes here. */
    it('skips is_public and keeps profile nodes out', () => {
      const query = mockQuery();
      applyIsFlowOrLabNode(query, 'node');

      expect(query.calls[0].sql).not.toContain('is_public');
      expect(query.calls[0].sql).toContain(
        'node.is_promoted IN (:...feedPlacements)',
      );
      expect(query.calls[0].params?.feedPlacements).toEqual([0, 1]);
    });

    it('still excludes deleted nodes', () => {
      const query = mockQuery();
      applyIsFlowOrLabNode(query, 'node');

      expect(query.calls[0].sql).toContain('deleted_at IS NULL');
    });
  });

  describe('applyIsPublicNode', () => {
    it('lists flow and profile nodes that are public', () => {
      const query = mockQuery();
      applyIsPublicNode(query, 'node');

      expect(query.calls[0].sql).toContain(
        'node.is_promoted IN (:...publicPlacements)',
      );
      expect(query.calls[0].sql).toContain('node.is_public = 1');
      expect(query.calls[0].params?.publicPlacements).toEqual([1, 2]);
    });
  });

  describe('applyVisibleToViewer', () => {
    it('restricts guests to flow and profile nodes', () => {
      const query = mockQuery();
      applyVisibleToViewer(query, 'node', false);

      expect(query.calls[0].params?.publicPlacements).toEqual([1, 2]);
    });

    it('gives authed viewers every post, lab included', () => {
      const query = mockQuery();
      applyVisibleToViewer(query, 'node', true);

      expect(query.calls[0].sql).not.toContain('is_promoted');
    });
  });
});
