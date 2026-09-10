import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BORIS_NODE_ID,
  NODE_TYPES,
  USER_INACTIVITY_DAYS,
} from '@vault/common/constants';
import { Repository } from 'typeorm';

import { Comment } from '../../entities/comment.entity';
import { File } from '../../entities/file.entity';
import { Node } from '../../entities/node.entity';
import { User } from '../../entities/user.entity';
import { toWireDate } from '../../wire/serialize';
import { applyIsFlowNode } from '../node/node.predicates';

/** `GET /stats/` response. */
export interface WireStats {
  users: { total: number; alive: number };
  nodes: {
    images: number;
    audios: number;
    videos: number;
    texts: number;
    total: number;
    by_month: number[];
  };
  comments: { total: number; by_month: number[] };
  files: { count: number; size: number };
  timestamps: { boris_last_comment: string; flow_last_post: string };
}

/**
 * Monthly row counts. Unlike the `total` counters, these include soft-deleted
 * rows and every node type. Bucket count comes from the CTE; it is not padded.
 */
const monthlyCountSql = (table: 'node' | 'comment') => `
  WITH recursive dates AS (
    select DATE_FORMAT(NOW() - interval ? month, '%Y-%m-01') as date
    union all
    select Date + interval 1 month
    from dates
    where Date < NOW() - interval 1 month
  )
  SELECT
    dates.date,
    IF (grouped.cnt IS NULL, 0, grouped.cnt) as cnt
  FROM dates
  LEFT JOIN (
    SELECT
      count(*) as cnt,
      DATE_FORMAT(\`${table}\`.created_at, '%Y-%m-01') as date
    FROM \`${table}\`
    GROUP BY date
  ) grouped ON grouped.date = dates.date
`;

const MONTHS = 12;

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    @InjectRepository(File) private readonly files: Repository<File>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async getStats(): Promise<WireStats> {
    const [
      usersTotal,
      usersAlive,
      images,
      audios,
      videos,
      texts,
      nodesByMonth,
      commentsTotal,
      commentsByMonth,
      filesCount,
      filesSize,
      borisLastComment,
      flowLastPost,
    ] = await Promise.all([
      this.countUsers(),
      this.countAliveUsers(),
      this.countNodeType(NODE_TYPES.IMAGE),
      this.countNodeType(NODE_TYPES.AUDIO),
      this.countNodeType(NODE_TYPES.VIDEO),
      this.countNodeType(NODE_TYPES.TEXT),
      this.countByMonth('node'),
      this.countComments(),
      this.countByMonth('comment'),
      this.countFiles(),
      this.sumFileSizes(),
      this.getBorisLastComment(),
      this.getFlowLastPostDate(),
    ]);

    return {
      users: { total: usersTotal, alive: usersAlive },
      nodes: {
        images,
        audios,
        videos,
        texts,
        // Sum of the four counted types only: excludes `webm` and `boris`.
        total: images + audios + videos + texts,
        by_month: nodesByMonth,
      },
      comments: { total: commentsTotal, by_month: commentsByMonth },
      files: { count: filesCount, size: filesSize },
      timestamps: {
        boris_last_comment: borisLastComment,
        flow_last_post: flowLastPost,
      },
    };
  }

  /** Totals exclude soft-deleted rows; `by_month` does not. */
  private countUsers(): Promise<number> {
    return this.users
      .createQueryBuilder('user')
      .where('user.deleted_at IS NULL')
      .getCount();
  }

  private countAliveUsers(): Promise<number> {
    return this.users
      .createQueryBuilder('user')
      .where('user.deleted_at IS NULL')
      .andWhere(`user.last_seen > NOW() - INTERVAL :days DAY`, {
        days: USER_INACTIVITY_DAYS,
      })
      .getCount();
  }

  private countNodeType(type: string): Promise<number> {
    return this.nodes
      .createQueryBuilder('node')
      .where('node.deleted_at IS NULL')
      .andWhere('node.type = :type', { type })
      .getCount();
  }

  private countComments(): Promise<number> {
    return this.comments
      .createQueryBuilder('comment')
      .where('comment.deleted_at IS NULL')
      .getCount();
  }

  private countFiles(): Promise<number> {
    return this.files
      .createQueryBuilder('file')
      .where('file.deleted_at IS NULL')
      .getCount();
  }

  /** Only files with a `target` count towards the total size. */
  private async sumFileSizes(): Promise<number> {
    const row: { size: string | null } | undefined = await this.files
      .createQueryBuilder('file')
      .select('SUM(file.size)', 'size')
      .where('file.deleted_at IS NULL')
      .andWhere('file.target IS NOT NULL')
      .getRawOne();

    return Number(row?.size ?? 0);
  }

  private async countByMonth(table: 'node' | 'comment'): Promise<number[]> {
    const rows: Array<{ date: string; cnt: number | string }> =
      await this.nodes.query(monthlyCountSql(table), [MONTHS]);

    return rows.map((row) => Number(row.cnt));
  }

  /** A missing Boris node yields the zero date rather than an error. */
  private async getBorisLastComment(): Promise<string> {
    const boris = await this.nodes
      .createQueryBuilder('node')
      .where('node.id = :id', { id: BORIS_NODE_ID })
      .andWhere('node.deleted_at IS NULL')
      .getOne();

    return toWireDate(boris?.commentedAt);
  }

  private async getFlowLastPostDate(): Promise<string> {
    const node = await applyIsFlowNode(
      this.nodes.createQueryBuilder('node'),
      'node',
    )
      .orderBy('node.created_at', 'DESC')
      .limit(1)
      .getOne();

    return toWireDate(node?.createdAt);
  }
}
