import { BORIS_NODE_ID } from '@vault/common/constants';

import type { Node } from '../../entities/node.entity';

/** Prefix on stored urls, standing in for the static host. */
const URL_PREFIX = 'REMOTE_CURRENT://';

/** Public permalink for a node. Boris has its own route. */
export const nodePermalink = (host: string, nodeId: number): string =>
  nodeId === BORIS_NODE_ID ? `${host}/boris` : `${host}/post${nodeId}`;

/**
 * Body of the wall post: title, author, link, then the description when there
 * is one.
 */
export const buildPostMessage = (
  node: Pick<Node, 'id' | 'title' | 'description'> & {
    user?: { username?: string } | null;
  },
  host: string,
): string => {
  const head = [
    node.title ?? '',
    `~${node.user?.username ?? ''}`,
    nodePermalink(host, node.id),
  ].join('\n');

  return node.description ? `${head}\n\n${node.description}` : head;
};

/**
 * Path of a node's thumbnail relative to the uploads root, or null when it has
 * none or points somewhere else.
 *
 * Only stored upload urls can be resolved to a local file; a thumbnail derived
 * from an external service (a video cover, say) has nothing on disk.
 */
export const thumbnailStoragePath = (
  thumbnail: string | null | undefined,
): string | null => {
  if (!thumbnail || !thumbnail.startsWith(URL_PREFIX)) {
    return null;
  }

  const path = thumbnail.slice(URL_PREFIX.length);

  return path || null;
};

/** Permalink of a published post, recorded as the node's social backlink. */
export const wallPostLink = (groupId: number, postId: number): string =>
  `https://vk.com/wall-${groupId}_${postId}`;
