import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Node } from '../../entities/node.entity';
import { Tag } from '../../entities/tag.entity';
import { toWireShallowNode, type WireShallowNode } from '../../wire/serialize';
import { applyIsFlowNode, applyIsFlowOrLabNode } from '../node/node.predicates';

export interface WireTagNodesResponse {
  nodes: WireShallowNode[];
  count: number;
}

/** Autocomplete is capped at 25 rows. */
export const AUTOCOMPLETE_LIMIT = 25;

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private readonly tags: Repository<Tag>,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
  ) {}

  /** Case-insensitive exact match. A miss must surface as a 404. */
  findByName(name: string): Promise<Tag | null> {
    return this.tags
      .createQueryBuilder('tag')
      .where('LOWER(tag.title) = :name', { name: name.toLowerCase() })
      .getOne();
  }

  /** Nodes carrying a tag. Guests are limited to the flow. */
  async getNodesOfTag(
    tag: Tag,
    onlyFlow: boolean,
    limit: number,
    offset: number,
  ): Promise<WireTagNodesResponse> {
    const build = () => {
      const query = this.nodes
        .createQueryBuilder('node')
        .innerJoin(
          'node_tags_tag',
          'nt',
          'nt.nodeId = node.id AND nt.tagId = :tagId',
          { tagId: tag.id },
        );

      return onlyFlow
        ? applyIsFlowNode(query, 'node')
        : applyIsFlowOrLabNode(query, 'node');
    };

    const count = await build().getCount();

    const rows = await build()
      .leftJoinAndSelect('node.user', 'user')
      .leftJoinAndSelect('user.photo', 'userPhoto')
      .orderBy('node.created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return { nodes: rows.map(toWireShallowNode), count };
  }

  /** Substring match on title, returning bare title strings. */
  async autocomplete(search: string, exclude: string[]): Promise<string[]> {
    const query = this.tags
      .createQueryBuilder('tag')
      .where("tag.title LIKE CONCAT('%', :search, '%')", { search })
      .limit(AUTOCOMPLETE_LIMIT);

    if (exclude.length > 0) {
      query.andWhere('tag.title NOT IN (:...exclude)', { exclude });
    }

    const rows = await query.getMany();

    return rows.map(tag => tag.title);
  }
}
