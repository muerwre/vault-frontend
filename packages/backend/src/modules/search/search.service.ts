import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Node } from '../../entities/node.entity';
import { toWireDate, toWireString } from '../../wire/serialize';
import { applyVisibleToViewer } from '../node/node.predicates';

/** One item of `GET /search/nodes`. */
export interface WireSearchNode {
  id: number;
  thumbnail: string;
  title: string;
  created_at: string;
  is_promoted: boolean;
}

export interface WireSearchResponse {
  total: number;
  nodes: WireSearchNode[];
}

export const SEARCH_DEFAULT_TAKE = 20;

/**
 * Strips all but Cyrillic letters, word characters, whitespace and basic
 * punctuation, then trims.
 *
 * The class is intentionally exact, quirks included (`А-Яа-я` excludes `ё`).
 * Changing it changes which queries return results.
 */
export const sanitizeSearchText = (text: string): string =>
  text.replace(/[^А-Яа-я\w\s-.,!?]+/g, '').trim();

@Injectable()
export class SearchService {
  constructor(@InjectRepository(Node) private readonly nodes: Repository<Node>) {}

  async searchNodes(
    rawText: string,
    take: number,
    skip: number,
    isUser: boolean,
  ): Promise<WireSearchResponse> {
    const text = sanitizeSearchText(rawText ?? '');

    // An empty query returns nothing rather than listing everything.
    if (text.length === 0) {
      return { total: 0, nodes: [] };
    }

    const build = () => {
      const query = this.nodes
        .createQueryBuilder('node')
        .where(
          "(node.title LIKE CONCAT('%', :text, '%') OR node.description LIKE CONCAT('%', :text, '%'))",
          { text },
        );

      return applyVisibleToViewer(query, 'node', isUser);
    };

    const total = await build().getCount();

    // Prefix matches on title rank above description, then newest first.
    const rows = await build()
      .leftJoinAndSelect('node.user', 'user')
      .leftJoinAndSelect('user.photo', 'userPhoto')
      .addSelect(
        "CASE WHEN node.title LIKE CONCAT(:text, '%') THEN 1 ELSE 0 END",
        'title_prefix',
      )
      .addSelect(
        "CASE WHEN node.description LIKE CONCAT(:text, '%') THEN 1 ELSE 0 END",
        'description_prefix',
      )
      .orderBy('title_prefix', 'DESC')
      .addOrderBy('description_prefix', 'DESC')
      .addOrderBy('node.created_at', 'DESC')
      .limit(take)
      .offset(skip)
      .getMany();

    return {
      total,
      nodes: rows.map(node => ({
        id: node.id,
        thumbnail: toWireString(node.thumbnail),
        title: toWireString(node.title),
        created_at: toWireDate(node.createdAt),
        is_promoted: Boolean(node.isPromoted),
      })),
    };
  }
}
