import type { Node } from '../../entities/node.entity';

import {
  buildPostMessage,
  nodePermalink,
  thumbnailStoragePath,
  wallPostLink,
} from './vk.content';

const node = (extra: Partial<Node> = {}) =>
  ({
    id: 100,
    title: 'Заголовок',
    description: '',
    user: { username: 'muerwre' },
    ...extra,
  }) as Node & { user: { username: string } };

describe('vk post content', () => {
  describe('nodePermalink', () => {
    it('builds a post link', () => {
      expect(nodePermalink('https://vault48.org', 100)).toBe(
        'https://vault48.org/post100',
      );
    });

    /** Boris is a singleton with its own route. */
    it('sends the boris node to its own page', () => {
      expect(nodePermalink('https://vault48.org', 696)).toBe(
        'https://vault48.org/boris',
      );
    });
  });

  describe('buildPostMessage', () => {
    it('is title, author and link on their own lines', () => {
      expect(buildPostMessage(node(), 'https://vault48.org')).toBe(
        'Заголовок\n~muerwre\nhttps://vault48.org/post100',
      );
    });

    it('appends the description after a blank line', () => {
      expect(
        buildPostMessage(node({ description: 'Описание' }), 'https://v.org'),
      ).toBe('Заголовок\n~muerwre\nhttps://v.org/post100\n\nОписание');
    });

    it('omits the description block when there is none', () => {
      expect(buildPostMessage(node(), 'https://v.org')).not.toContain('\n\n');
    });

    it('tolerates a missing title or author', () => {
      const message = buildPostMessage(
        { id: 5, title: '', description: '', user: null },
        'https://v.org',
      );

      expect(message).toBe('\n~\nhttps://v.org/post5');
    });
  });

  describe('thumbnailStoragePath', () => {
    it('strips the url prefix to give a path under the uploads root', () => {
      expect(
        thumbnailStoragePath('REMOTE_CURRENT://uploads/2026/5/image/a.jpg'),
      ).toBe('uploads/2026/5/image/a.jpg');
    });

    /** Only stored uploads have a local file; anything else has nothing. */
    it('returns null for an external thumbnail', () => {
      expect(
        thumbnailStoragePath('https://i.ytimg.com/vi/abc/hqdefault.jpg'),
      ).toBeNull();
    });

    it('returns null when there is no thumbnail', () => {
      expect(thumbnailStoragePath('')).toBeNull();
      expect(thumbnailStoragePath(null)).toBeNull();
      expect(thumbnailStoragePath(undefined)).toBeNull();
    });

    it('returns null for a prefix with nothing after it', () => {
      expect(thumbnailStoragePath('REMOTE_CURRENT://')).toBeNull();
    });
  });

  describe('wallPostLink', () => {
    /** A group wall permalink negates the group id. */
    it('builds the permalink of a group post', () => {
      expect(wallPostLink(46579663, 12345)).toBe(
        'https://vk.com/wall-46579663_12345',
      );
    });
  });
});
