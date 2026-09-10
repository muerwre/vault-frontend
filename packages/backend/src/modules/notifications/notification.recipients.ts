import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { USER_INACTIVITY_DAYS } from '@vault/common/constants';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';

/** The `notification_settings` flags a subscription can be keyed on. */
type SubscriptionColumn =
  | 'subscribed_to_flow'
  | 'subscribed_to_boris'
  | 'subscribed_to_comments';

/**
 * Resolves who should receive a notification.
 *
 * Every audience is restricted the same way: notifications enabled, the
 * relevant subscription on, the account alive, and the user seen within the
 * inactivity window — long-dormant accounts accrue nothing.
 */
@Injectable()
export class NotificationRecipientsService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  flowWatchers(): Promise<number[]> {
    return this.subscribers('subscribed_to_flow');
  }

  borisWatchers(): Promise<number[]> {
    return this.subscribers('subscribed_to_boris');
  }

  /**
   * The node's author plus everyone who has commented on it, filtered to those
   * still subscribed to comment notifications.
   */
  async nodeParticipants(nodeId: number): Promise<number[]> {
    const rows = await this.baseQuery('subscribed_to_comments')
      .andWhere(
        `user.id IN (
           SELECT c.userId FROM comment c WHERE c.nodeId = :nodeId
           UNION
           SELECT n.userId FROM node n WHERE n.id = :nodeId
         )`,
        { nodeId },
      )
      .getRawMany<{ id: number }>();

    return rows.map((row) => Number(row.id));
  }

  private async subscribers(column: SubscriptionColumn): Promise<number[]> {
    const rows = await this.baseQuery(column).getRawMany<{ id: number }>();

    return rows.map((row) => Number(row.id));
  }

  /**
   * Selects distinct user ids rather than whole rows: `notification_settings`
   * has no unique index on `userId`, so a duplicated settings row would
   * otherwise yield the same recipient twice.
   */
  private baseQuery(column: SubscriptionColumn) {
    return this.users
      .createQueryBuilder('user')
      .select('DISTINCT user.id', 'id')
      .innerJoin(
        'notification_settings',
        'settings',
        'settings.userId = user.id',
      )
      .where('user.deleted_at IS NULL')
      .andWhere('settings.enabled = 1')
      .andWhere(`settings.${column} = 1`)
      .andWhere('user.last_seen > NOW() - INTERVAL :days DAY', {
        days: USER_INACTIVITY_DAYS,
      });
  }
}
