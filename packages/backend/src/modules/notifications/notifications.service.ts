import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BORIS_NODE_ID,
  NOTIFICATION_ITEM_TYPES,
  type NotificationItemType,
} from '@vault/common/constants';
import { In, Repository } from 'typeorm';

import { Comment } from '../../entities/comment.entity';
import { Node } from '../../entities/node.entity';
import { NotificationSettings } from '../../entities/notification.entity';
import { UserNotification } from '../../entities/notification.entity';
import {
  toWireDate,
  toWireDateOrNull,
  toWireShallowUser,
  toWireString,
  type WireShallowUser,
} from '../../wire/serialize';

/** `itemId` is camelCase here, unlike its snake_case neighbours. */
export interface WireNotificationItem {
  id: number;
  itemId: number;
  url: string;
  type: string;
  title: string;
  text: string;
  user?: WireShallowUser;
  thumbnail: string;
  created_at: string;
}

/**
 * Settings on the wire. The keys do not match the columns: `flow`, `boris` and
 * `comments` stand for the three `subscribed_to_*` columns.
 */
export interface WireNotificationSettings {
  enabled: boolean;
  show_indicator: boolean;
  flow: boolean;
  boris: boolean;
  comments: boolean;
  send_telegram: boolean;
  send_email: boolean;
  last_seen: string | null;
  last_cleared: string | null;
  /** Derived from the newest notification, not a stored column. */
  last_date: string | null;
}

export interface SettingsPatch {
  enabled?: boolean;
  show_indicator?: boolean;
  send_telegram?: boolean;
  send_email?: boolean;
  flow?: boolean;
  boris?: boolean;
  comments?: boolean;
  last_seen?: string;
  last_cleared?: string;
}

export const NOTIFICATIONS_PAGE_SIZE = 20;

/** Applied when a user has no settings row yet. */
const DEFAULT_SETTINGS = {
  enabled: false,
  showIndicator: true,
  sendTelegram: true,
  sendEmail: true,
  subscribedToFlow: true,
  subscribedToBoris: true,
  subscribedToComments: true,
} as const;

/** Boris has its own route; everything else is a post permalink. */
const nodeUrl = (nodeId: number): string =>
  nodeId === BORIS_NODE_ID ? '/boris' : `/post${nodeId}`;

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(UserNotification)
    private readonly notifications: Repository<UserNotification>,
    @InjectRepository(NotificationSettings)
    private readonly settings: Repository<NotificationSettings>,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
  ) {}

  /**
   * The user's feed, newest first.
   *
   * Rows whose referenced node or comment no longer exists are **skipped**, so
   * the feed can be shorter than the page size. Timestamps come from the
   * referenced entity rather than the notification row.
   */
  async list(userId: number): Promise<WireNotificationItem[]> {
    const rows = await this.notifications
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .andWhere('n.deleted_at IS NULL')
      .orderBy('n.created_at', 'DESC')
      // `created_at` has second precision, so ties need a stable tiebreaker.
      .addOrderBy('n.id', 'DESC')
      .limit(NOTIFICATIONS_PAGE_SIZE)
      .getMany();

    if (rows.length === 0) {
      return [];
    }

    const idsOfType = (type: NotificationItemType) =>
      rows
        .filter(row => row.type === type && row.itemId !== null)
        .map(row => row.itemId as number);

    const commentIds = [
      ...idsOfType(NOTIFICATION_ITEM_TYPES.COMMENT),
      ...idsOfType(NOTIFICATION_ITEM_TYPES.BORIS),
    ];

    const [nodes, comments] = await Promise.all([
      this.loadNodes(idsOfType(NOTIFICATION_ITEM_TYPES.NODE)),
      this.loadComments(commentIds),
    ]);

    const items: WireNotificationItem[] = [];

    for (const row of rows) {
      const item =
        row.type === NOTIFICATION_ITEM_TYPES.NODE
          ? this.fromNode(row, nodes.get(row.itemId as number))
          : this.fromComment(row, comments.get(row.itemId as number));

      if (item) {
        items.push(item);
      }
    }

    return items;
  }

  /** The newest notification's timestamp, or null when the feed is empty. */
  async getLastDate(userId: number): Promise<string | null> {
    const items = await this.list(userId);

    return items[0]?.created_at ?? null;
  }

  /** Reads the settings row, creating it with the defaults on first access. */
  async getSettings(userId: number): Promise<NotificationSettings> {
    const existing = await this.settings
      .createQueryBuilder('s')
      .where('s.userId = :userId', { userId })
      // There is no unique index on userId, so duplicates are possible.
      .orderBy('s.id', 'ASC')
      .getOne();

    if (existing) {
      return existing;
    }

    return this.settings.save(this.settings.create({ userId, ...DEFAULT_SETTINGS }));
  }

  /** Only supplied fields are written; absent ones keep their stored value. */
  async updateSettings(
    userId: number,
    patch: SettingsPatch,
  ): Promise<NotificationSettings> {
    const settings = await this.getSettings(userId);

    const assign = <K extends keyof NotificationSettings>(
      key: K,
      value: NotificationSettings[K] | undefined,
    ) => {
      if (value !== undefined) {
        settings[key] = value;
      }
    };

    assign('enabled', patch.enabled);
    assign('showIndicator', patch.show_indicator);
    assign('sendTelegram', patch.send_telegram);
    assign('sendEmail', patch.send_email);
    assign('subscribedToFlow', patch.flow);
    assign('subscribedToBoris', patch.boris);
    assign('subscribedToComments', patch.comments);
    assign('lastSeen', this.toDate(patch.last_seen));
    assign('lastCleared', this.toDate(patch.last_cleared));

    return this.settings.save(settings);
  }

  toWireSettings(
    settings: NotificationSettings,
    lastDate: string | null,
  ): WireNotificationSettings {
    return {
      enabled: Boolean(settings.enabled),
      show_indicator: Boolean(settings.showIndicator),
      flow: Boolean(settings.subscribedToFlow),
      boris: Boolean(settings.subscribedToBoris),
      comments: Boolean(settings.subscribedToComments),
      send_telegram: Boolean(settings.sendTelegram),
      send_email: Boolean(settings.sendEmail),
      last_seen: toWireDateOrNull(settings.lastSeen),
      last_cleared: toWireDateOrNull(settings.lastCleared),
      last_date: lastDate,
    };
  }

  private toDate(value: string | undefined): Date | undefined {
    if (value === undefined) {
      return undefined;
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  private async loadNodes(ids: number[]): Promise<Map<number, Node>> {
    if (ids.length === 0) {
      return new Map();
    }

    const rows = await this.nodes.find({
      where: { id: In(ids) },
      relations: { user: { photo: true } },
    });

    return new Map(rows.map(node => [node.id, node]));
  }

  private async loadComments(ids: number[]): Promise<Map<number, Comment>> {
    if (ids.length === 0) {
      return new Map();
    }

    const rows = await this.comments.find({
      where: { id: In(ids) },
      relations: { user: { photo: true }, node: true },
    });

    return new Map(rows.map(comment => [comment.id, comment]));
  }

  private fromNode(
    row: UserNotification,
    node: Node | undefined,
  ): WireNotificationItem | null {
    if (!node) {
      return null;
    }

    return {
      id: row.id,
      itemId: node.id,
      url: nodeUrl(node.id),
      type: NOTIFICATION_ITEM_TYPES.NODE,
      title: toWireString(node.title),
      text: toWireString(node.description),
      thumbnail: toWireString(node.thumbnail),
      created_at: toWireDate(node.createdAt),
      user: toWireShallowUser(node.user),
    };
  }

  /** Boris comments carry the `boris` type but are otherwise identical. */
  private fromComment(
    row: UserNotification,
    comment: Comment | undefined,
  ): WireNotificationItem | null {
    if (!comment || !comment.node) {
      return null;
    }

    return {
      id: row.id,
      itemId: comment.id,
      url: nodeUrl(comment.node.id),
      type:
        row.type === NOTIFICATION_ITEM_TYPES.BORIS
          ? NOTIFICATION_ITEM_TYPES.BORIS
          : NOTIFICATION_ITEM_TYPES.COMMENT,
      title: toWireString(comment.node.title),
      text: toWireString(comment.text),
      thumbnail: toWireString(comment.node.thumbnail),
      created_at: toWireDate(comment.createdAt),
      user: toWireShallowUser(comment.user),
    };
  }
}
