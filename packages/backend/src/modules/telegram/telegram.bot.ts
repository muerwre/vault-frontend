import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OAUTH_PROVIDERS } from '@vault/common/constants';
import { IsNull, Not, Repository } from 'typeorm';

import {
  getPublicUrl,
  getTelegramConfig,
  isTelegramBotUsable,
} from '../../config/env';
import { Social } from '../../entities/social.entity';
import { NotificationsService } from '../notifications/notifications.service';

import {
  alreadyDisabledMessage,
  alreadyEnabledMessage,
  greetingMessage,
  helpMessage,
  parseCommand,
  startedMessage,
  stoppedMessage,
  type TelegramMessage,
  unauthorizedMessage,
  unexpectedErrorMessage,
} from './telegram.messages';
import { TelegramTransport } from './telegram.transport';

/** The slice of a Bot API `Update` the bot reads. */
export interface TelegramUpdate {
  update_id: number;
  message?: {
    text?: string;
    chat?: { id: number; type?: string };
    from?: { id: number; is_bot?: boolean };
  };
}

/** Seconds Telegram holds a `getUpdates` call open waiting for news. */
const POLL_TIMEOUT_SECS = 25;

const RETRY_MIN_MS = 5_000;
const RETRY_MAX_MS = 5 * 60_000;

/** Resolves after `ms`, or immediately once `signal` aborts. */
const pause = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const timer = setTimeout(done, ms);

    function done() {
      clearTimeout(timer);
      signal.removeEventListener('abort', done);
      resolve();
    }

    signal.addEventListener('abort', done);
  });

/**
 * The interactive bot. Only accounts linked through the profile settings can
 * use it; `/start` and `/stop` toggle Telegram delivery for the linked user.
 *
 * Long-polls rather than taking a webhook, so it needs no public endpoint and
 * works through the outbound proxy.
 */
@Injectable()
export class TelegramBot implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger('TelegramBot');

  private abort?: AbortController;

  private loop?: Promise<void>;

  constructor(
    private readonly transport: TelegramTransport,
    private readonly notifications: NotificationsService,
    @InjectRepository(Social) private readonly socials: Repository<Social>,
  ) {}

  /** True when the bot runs and may message people. */
  get isEnabled(): boolean {
    return isTelegramBotUsable(getTelegramConfig());
  }

  onApplicationBootstrap(): void {
    if (!this.isEnabled) {
      const { token, botUsername } = getTelegramConfig();

      this.logger.log(
        botUsername
          ? 'bot and delivery off: TELEGRAM_BOT_USERNAME is set but TELEGRAM_TOKEN is not'
          : 'bot and delivery off (no TELEGRAM_BOT_USERNAME)' +
              (token ? '; the login widget still verifies' : ''),
      );
      return;
    }

    this.abort = new AbortController();
    this.loop = this.poll(this.abort.signal);
  }

  async onModuleDestroy(): Promise<void> {
    this.abort?.abort();
    await this.loop;
    this.abort = undefined;
    this.loop = undefined;
  }

  /** Sends one message. Throws on failure; callers decide whether it matters. */
  async send(chatId: string | number, message: TelegramMessage): Promise<void> {
    await this.transport.call('sendMessage', {
      chat_id: chatId,
      text: message.text,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: !message.showPreview },
    });
  }

  /**
   * Welcomes a freshly linked account. Never throws: linking must succeed even
   * when Telegram is unreachable, and the user can always type `/start` later.
   */
  async greet(accountId: string, deliveryEnabled: boolean): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      await this.send(
        accountId,
        greetingMessage(getPublicUrl(), deliveryEnabled),
      );
    } catch (error) {
      this.logger.warn(`could not greet ${accountId}: ${describe(error)}`);
    }
  }

  /**
   * Answers one incoming update. Public so the command flow can be driven
   * without polling. Only private chats are answered: replies go to the
   * sender, and a bot added to a group must not message every member.
   */
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    const message = update.message;
    const sender = message?.from;

    if (!message || !sender || sender.is_bot) {
      return;
    }

    if (message.chat?.type && message.chat.type !== 'private') {
      return;
    }

    const userId = await this.linkedUserId(String(sender.id));

    if (userId === null) {
      await this.reply(sender.id, unauthorizedMessage(getPublicUrl()));
      return;
    }

    const command = parseCommand(message.text);

    try {
      if (command) {
        this.logger.log(`/${command} from user ${userId}`);
      }

      switch (command) {
        case 'start':
          await this.reply(sender.id, await this.start(userId));
          break;
        case 'stop':
          await this.reply(sender.id, await this.stop(userId));
          break;
        case 'help':
          await this.reply(sender.id, helpMessage(getPublicUrl()));
          break;
        default:
          // Anything else from a linked user goes unanswered.
          break;
      }
    } catch (error) {
      this.logger.warn(
        `/${command} failed for ${sender.id}: ${describe(error)}`,
      );
      await this.reply(sender.id, unexpectedErrorMessage());
    }
  }

  /**
   * Turns delivery on. Enabling notifications as a whole also re-enables mail,
   * which would be a surprise for someone who only asked for Telegram — so mail
   * is switched off when notifications were off before.
   */
  private async start(userId: number): Promise<TelegramMessage> {
    const settings = await this.notifications.getSettings(userId);

    if (settings.enabled && settings.sendTelegram) {
      return alreadyEnabledMessage();
    }

    await this.notifications.updateSettings(userId, {
      enabled: true,
      send_telegram: true,
      ...(!settings.enabled && settings.sendEmail ? { send_email: false } : {}),
    });

    return startedMessage(getPublicUrl());
  }

  /** Turns Telegram delivery off, leaving every other setting alone. */
  private async stop(userId: number): Promise<TelegramMessage> {
    const settings = await this.notifications.getSettings(userId);

    if (!settings.enabled || !settings.sendTelegram) {
      return alreadyDisabledMessage();
    }

    await this.notifications.updateSettings(userId, { send_telegram: false });

    return stoppedMessage();
  }

  /** The user a Telegram account is linked to, or null for a stranger. */
  private async linkedUserId(accountId: string): Promise<number | null> {
    const social = await this.socials.findOne({
      where: {
        provider: OAUTH_PROVIDERS.TELEGRAM,
        accountId,
        userId: Not(IsNull()),
      },
      order: { id: 'ASC' },
    });

    return social?.userId ?? null;
  }

  /** A reply that fails is logged, never thrown back into the poll loop. */
  private async reply(chatId: number, message: TelegramMessage): Promise<void> {
    try {
      await this.send(chatId, message);
    } catch (error) {
      this.logger.warn(`could not reply to ${chatId}: ${describe(error)}`);
    }
  }

  private async poll(signal: AbortSignal): Promise<void> {
    let offset = 0;
    let retryMs = RETRY_MIN_MS;

    try {
      const me = await this.transport.call<{ username?: string }>(
        'getMe',
        {},
        signal,
      );
      this.logger.log(`polling as @${me.username ?? '?'}`);
    } catch (error) {
      if (!signal.aborted) {
        this.logger.warn(`getMe failed, polling anyway: ${describe(error)}`);
      }
    }

    while (!signal.aborted) {
      try {
        const updates = await this.transport.call<TelegramUpdate[]>(
          'getUpdates',
          {
            offset,
            timeout: POLL_TIMEOUT_SECS,
            allowed_updates: ['message'],
          },
          signal,
        );

        retryMs = RETRY_MIN_MS;

        for (const update of updates) {
          // Advance first, so an update that keeps failing is not redelivered forever.
          offset = update.update_id + 1;

          try {
            await this.handleUpdate(update);
          } catch (error) {
            this.logger.warn(
              `update ${update.update_id} failed: ${describe(error)}`,
            );
          }
        }
      } catch (error) {
        if (signal.aborted) {
          break;
        }

        this.logger.warn(
          `polling failed, retrying in ${retryMs / 1000}s: ${describe(error)}`,
        );
        await pause(retryMs, signal);
        retryMs = Math.min(retryMs * 2, RETRY_MAX_MS);
      }
    }
  }
}

const describe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
