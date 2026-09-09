import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Node } from '../../entities/node.entity';
import { Tag } from '../../entities/tag.entity';

/**
 * Owns the `node_tags_tag` junction. The whole set is rewritten rather than
 * diffed, so stored rows keep the order the caller supplied.
 */
@Injectable()
export class NodeTagsService {
  constructor(
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(Tag) private readonly tags: Repository<Tag>,
  ) {}

  getTags(nodeId: number): Promise<Tag[]> {
    return this.tags
      .createQueryBuilder('tag')
      .innerJoin('node_tags_tag', 'nt', 'nt.tagId = tag.id AND nt.nodeId = :nodeId', {
        nodeId,
      })
      .getMany();
  }

  /** Replaces the node's tags with exactly this set. */
  async setTags(nodeId: number, tags: Tag[]): Promise<Tag[]> {
    await this.nodes.manager.transaction(async manager => {
      await manager.query('DELETE FROM node_tags_tag WHERE nodeId = ?', [nodeId]);

      if (tags.length > 0) {
        await manager.query(
          `INSERT INTO node_tags_tag (nodeId, tagId) VALUES ${tags
            .map(() => '(?, ?)')
            .join(', ')}`,
          tags.flatMap(tag => [nodeId, tag.id]),
        );
      }
    });

    return tags;
  }

  /** Adds to whatever the node already has, ignoring duplicates. */
  async addTags(nodeId: number, tags: Tag[]): Promise<Tag[]> {
    const current = await this.getTags(nodeId);
    const seen = new Set(current.map(tag => tag.id));
    const merged = [...current];

    for (const tag of tags) {
      if (!seen.has(tag.id)) {
        seen.add(tag.id);
        merged.push(tag);
      }
    }

    return this.setTags(nodeId, merged);
  }

  async removeTag(nodeId: number, tagId: number): Promise<Tag[]> {
    const remaining = (await this.getTags(nodeId)).filter(tag => tag.id !== tagId);

    return this.setTags(nodeId, remaining);
  }
}
