import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NOTIFICATION_ITEM_TYPES,
  OAUTH_PROVIDERS,
} from '@vault/common/constants';
import { In, Repository } from 'typeorm';

import {
  cooldownIntervalMs,
  describeCooldown,
  getPublicUrl,
  getTelegramConfig,
} from '../../config/env';
import { Comment } from '../../entities/comment.entity';
import { Node } from '../../entities/node.entity';
import {
  NotificationSettings,
  UserNotification,
  UserNotificationProcessed,
} from '../../entities/notification.entity';
import { Social } from '../../entities/social.entity';

import { TelegramBot } from './telegram.bot';
import {
  commentMessage,
  nodeMessage,
  pickPerRecipient,
  type TelegramMessage,
} from './telegram.messages';

/** Ledger key for this service in `user_notifications_processed`. */
export const TELEGRAM_SERVICE = OAUTH_PROVIDERS.TELEGRAM;

/** Most feed rows considered in one run. */
const BATCH_LIMIT = 100;

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/**
 * Delivers users' feed notifications as Telegram messages.
 *
 * Each run takes feed rows not yet in the ledger for this service and sends each
 * recipient their newest few. A row is recorded as processed **right after its
 * message goes out**, so a run cut short by a restart never sends it again;
 * every other row taken — ones it chose not to send — is recorded when the run
 * completes. So a row is attempted once: a recipient with Telegram off never
 * gets a backlog when they turn it on, and a failed send is not retried into a
 * duplicate.
 */
@Injectable()
export class TelegramNotificationSender
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('TelegramSender');

  private timer?: NodeJS.Timeout;

  /** The run in progress, if any. */
  private current?: Promise<void>;

  /** Set while shutting down: the run in progress stops between messages. */
  private stopping = false;

  constructor(
    private readonly bot: TelegramBot,
    @InjectRepository(UserNotification)
    private readonly feed: Repository<UserNotification>,
    @InjectRepository(UserNotificationProcessed)
    private readonly ledger: Repository<UserNotificationProcessed>,
    @InjectRepository(NotificationSettings)
    private readonly settings: Repository<NotificationSettings>,
    @InjectRepository(Social) private readonly socials: Repository<Social>,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
  ) {}

  onApplicationBootstrap(): void {
    if (!this.bot.isEnabled) {
      return;
    }

    const { cooldownMins, purgeAfterDays } = getTelegramConfig();

    this.logger.log(
      `delivering ${describeCooldown(cooldownMins)}, dropping after ${purgeAfterDays}d`,
    );

    void this.runOnce();

    this.timer = setInterval(() => {
      void this.runOnce();
    }, cooldownIntervalMs(cooldownMins));

    // Long-running and unattended: never hold the process open.
    this.timer.unref();
  }

  /**
   * Stops the loop and waits for a run in progress, which stops after the
   * message it is sending. What it had not sent stays unrecorded for the next
   * start.
   */
  async onModuleDestroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    if (!this.current) {
      return;
    }

    this.stopping = true;

    try {
      await this.current;
    } finally {
      this.stopping = false;
    }
  }

  /**
   * Delivers everything currently due. Exposed so a run can be driven directly
   * rather than waited on. Overlapping runs are skipped, since both would pick
   * up the same rows and send them twice.
   */
  async runOnce(now = new Date()): Promise<void> {
    if (this.current) {
      return;
    }

    this.current = this.deliver(now)
      .catch((error: unknown) => {
        this.logger.warn(
          `delivery run failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      })
      .finally(() => {
        this.current = undefined;
      });

    await this.current;
  }

  private async deliver(now: Date): Promise<void> {
    const { cooldownMins, purgeAfterDays, maxMessages } = getTelegramConfig();

    const due = await this.unsent(
      new Date(now.getTime() - purgeAfterDays * DAY_MS),
      new Date(now.getTime() - cooldownMins * MINUTE_MS),
    );

    if (due.length === 0) {
      return;
    }

    const messages = await this.toMessages(due);
    const picked = pickPerRecipient(messages, maxMessages);
    const accounts = await this.deliverableAccounts([...picked.keys()]);
    const recorded = new Set<number>();

    let sent = 0;
    let failed = 0;

    deliveries: for (const [userId, list] of picked) {
      const accountId = accounts.get(userId);

      if (!accountId) {
        continue;
      }

      for (const { message, rowId } of list) {
        if (this.stopping) {
          break deliveries;
        }

        try {
          await this.bot.send(accountId, message);
          sent += 1;
        } catch (error) {
          failed += 1;
          this.logger.warn(
            `could not deliver to user ${userId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }

        await this.markProcessed([rowId], now);
        recorded.add(rowId);
      }
    }

    if (this.stopping) {
      this.logger.log(
        `stopped early: sent ${sent}, failed ${failed}; the rest goes out on the next start`,
      );
      return;
    }

    await this.markProcessed(
      due.map((row) => row.id).filter((id) => !recorded.has(id)),
      now,
    );

    this.logger.log(
      `took ${due.length} notification(s): sent ${sent}, failed ${failed}, ` +
        `${accounts.size} recipient(s) with Telegram on`,
    );
  }

  /**
   * Feed rows this service has not handled, newest first, inside the delivery
   * window. The cooldown leaves time to edit or delete before anything goes
   * out; the purge horizon keeps a stalled sender from flooding people later.
   */
  private unsent(
    newerThan: Date,
    olderThan: Date,
  ): Promise<UserNotification[]> {
    return this.feed
      .createQueryBuilder('n')
      .leftJoin(
        UserNotificationProcessed,
        'p',
        'p.notification_id = n.id AND p.service = :service',
        { service: TELEGRAM_SERVICE },
      )
      .where('p.processed_at IS NULL')
      .andWhere('n.deleted_at IS NULL')
      .andWhere('n.created_at >= :newerThan AND n.created_at <= :olderThan', {
        newerThan,
        olderThan,
      })
      .orderBy('n.created_at', 'DESC')
      .addOrderBy('n.id', 'DESC')
      .limit(BATCH_LIMIT)
      .getMany();
  }

  /**
   * Renders rows into messages, keeping their order. A row whose node or
   * comment no longer exists or was deleted, or whose comment sits on a
   * deleted node, yields nothing.
   */
  private async toMessages(
    rows: UserNotification[],
  ): Promise<
    Array<{ recipient: number; message: TelegramMessage; rowId: number }>
  > {
    const publicUrl = getPublicUrl();

    const idsOf = (...types: string[]) => [
      ...new Set(
        rows
          .filter((row) => row.type && types.includes(row.type))
          .map((row) => row.itemId)
          .filter((id): id is number => id !== null),
      ),
    ];

    const nodeIds = idsOf(NOTIFICATION_ITEM_TYPES.NODE);
    const commentIds = idsOf(
      NOTIFICATION_ITEM_TYPES.COMMENT,
      NOTIFICATION_ITEM_TYPES.BORIS,
    );

    const nodes = new Map(
      nodeIds.length
        ? (
            await this.nodes
              .createQueryBuilder('node')
              .leftJoinAndSelect('node.user', 'user')
              .where('node.id IN (:...nodeIds)', { nodeIds })
              .andWhere('node.deleted_at IS NULL')
              .getMany()
          ).map((node) => [node.id, node])
        : [],
    );

    const comments = new Map(
      commentIds.length
        ? (
            await this.comments
              .createQueryBuilder('comment')
              .leftJoinAndSelect('comment.user', 'user')
              .innerJoinAndSelect('comment.node', 'node')
              .where('comment.id IN (:...commentIds)', { commentIds })
              .andWhere('comment.deleted_at IS NULL')
              // Nowhere to link to once the node is gone.
              .andWhere('node.deleted_at IS NULL')
              .getMany()
          ).map((comment) => [comment.id, comment])
        : [],
    );

    const out: Array<{
      recipient: number;
      message: TelegramMessage;
      rowId: number;
    }> = [];

    for (const row of rows) {
      if (row.userId === null || row.itemId === null) {
        continue;
      }

      let message: TelegramMessage | null = null;

      if (row.type === NOTIFICATION_ITEM_TYPES.NODE) {
        const node = nodes.get(row.itemId);
        message = node ? nodeMessage(publicUrl, node) : null;
      } else if (
        row.type === NOTIFICATION_ITEM_TYPES.COMMENT ||
        row.type === NOTIFICATION_ITEM_TYPES.BORIS
      ) {
        const comment = comments.get(row.itemId);
        message = comment ? commentMessage(publicUrl, comment) : null;
      }

      if (message) {
        out.push({ recipient: row.userId, message, rowId: row.id });
      }
    }

    return out;
  }

  /**
   * Telegram account for each recipient who wants Telegram delivery. Settings
   * and links may both be duplicated per user, so the lowest id wins.
   */
  private async deliverableAccounts(
    userIds: number[],
  ): Promise<Map<number, string>> {
    const accounts = new Map<number, string>();

    if (userIds.length === 0) {
      return accounts;
    }

    const settingsRows = await this.settings.find({
      where: { userId: In(userIds) },
      order: { id: 'ASC' },
    });

    const wanting = new Set<number>();
    const seen = new Set<number>();

    for (const row of settingsRows) {
      if (row.userId === null || seen.has(row.userId)) {
        continue;
      }

      seen.add(row.userId);

      if (row.enabled && row.sendTelegram) {
        wanting.add(row.userId);
      }
    }

    if (wanting.size === 0) {
      return accounts;
    }

    const links = await this.socials.find({
      where: { provider: TELEGRAM_SERVICE, userId: In([...wanting]) },
      order: { id: 'ASC' },
    });

    for (const link of links) {
      if (link.userId !== null && !accounts.has(link.userId)) {
        accounts.set(link.userId, link.accountId);
      }
    }

    return accounts;
  }

  private async markProcessed(ids: number[], now: Date): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const processedAt = new Date(now);
    processedAt.setMilliseconds(0);

    await this.ledger.insert(
      ids.map((notificationId) => ({
        service: TELEGRAM_SERVICE,
        processedAt,
        notificationId,
      })),
    );
  }
}
