import { BORIS_NODE_ID } from '@vault/common/constants';

/** One outgoing bot message. Text is Telegram HTML. */
export interface TelegramMessage {
  text: string;
  /** Telegram renders a link preview only when this is set. */
  showPreview: boolean;
}

/** Telegram refuses messages longer than this many characters. */
export const TELEGRAM_MAX_TEXT = 4096;

/**
 * Escapes text for Telegram's HTML mode, which rejects a whole message over a
 * single stray `<` or `&`. Every user-supplied value must pass through here.
 */
export const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Escapes a value placed inside a double-quoted attribute. */
const escapeAttr = (value: string): string =>
  escapeHtml(value).replace(/"/g, '&quot;');

/**
 * Escapes `value`, cutting it so the *escaped* result fits `budget`. Measured
 * after escaping because an entity is several characters long, and cut between
 * characters so no entity is ever split.
 */
export const escapeWithin = (value: string, budget: number): string => {
  const escaped = escapeHtml(value);

  if (escaped.length <= budget) {
    return escaped;
  }

  let out = '';

  for (const char of value) {
    const next = escapeHtml(char);

    if (out.length + next.length > budget - 1) {
      break;
    }

    out += next;
  }

  return `${out}…`;
};

export const nodeUrl = (publicUrl: string, nodeId: number): string =>
  nodeId === BORIS_NODE_ID
    ? `${publicUrl}/boris`
    : `${publicUrl}/post${nodeId}`;

/** Boris comments have no anchor: the page is one long thread. */
export const commentUrl = (
  publicUrl: string,
  nodeId: number,
  commentId: number,
): string =>
  nodeId === BORIS_NODE_ID
    ? nodeUrl(publicUrl, nodeId)
    : `${nodeUrl(publicUrl, nodeId)}#comment-${commentId}`;

export const notificationSettingsUrl = (publicUrl: string): string =>
  `${publicUrl}/?sidebar=settings&page=notifications`;

export const accountSettingsUrl = (publicUrl: string): string =>
  `${publicUrl}/?sidebar=settings&page=profile`;

const plain = (text: string): TelegramMessage => ({ text, showPreview: false });

export const helpMessage = (publicUrl: string): TelegramMessage =>
  plain(
    `Я присылаю уведомления с <a href="${escapeAttr(publicUrl)}">vault48.org</a> сюда, ` +
      `ты можешь выбрать какие именно в <a href="${escapeAttr(
        notificationSettingsUrl(publicUrl),
      )}">настройках уведомлений</a>.\n\n` +
      '/start - включить отправку\n/stop - выключить\n/help - это сообщение',
  );

export const alreadyEnabledMessage = (): TelegramMessage =>
  plain('Уже включены, не беспокойся ты так.');

export const startedMessage = (publicUrl: string): TelegramMessage =>
  plain(
    'Хорошо, теперь я буду отправлять тебе уведомления. Ты можешь выбрать какие именно в ' +
      `<a href="${escapeAttr(
        notificationSettingsUrl(publicUrl),
      )}">настройках уведомлений</a>.\n\n` +
      'Набери /stop если передумал.',
  );

export const alreadyDisabledMessage = (): TelegramMessage =>
  plain('Всё итак выключено, спокойно, спокойно.');

export const stoppedMessage = (): TelegramMessage =>
  plain(
    'Прости, что надоедал. Набери /start если снова захочешь получать уведомления.',
  );

export const unauthorizedMessage = (publicUrl: string): TelegramMessage =>
  plain(
    'Эй, я тебя не знаю! Давай сначала привяжем аккаунт в ' +
      `<a href="${escapeAttr(accountSettingsUrl(publicUrl))}">твоём профиле</a>.`,
  );

export const unexpectedErrorMessage = (): TelegramMessage =>
  plain('Что-то случилось, и я не могу удовлетворить твою просьбу.');

/**
 * Sent when an account is linked. Its wording depends on whether delivery is
 * already on, since a user with notifications disabled needs `/start` first.
 */
/** Linking an account switches delivery on, so the greeting assumes it. */
export const greetingMessage = (publicUrl: string): TelegramMessage =>
  plain(
    'Бип-буп-боп! Привет!\n\nЯ буду присылать тебе уведомления, которые указаны в ' +
      `<a href="${escapeAttr(
        notificationSettingsUrl(publicUrl),
      )}">настройках уведомлений</a>.\n\n` +
      'Набери /help, чтобы узнать, что я могу или /stop если буду надоедать.',
  );

export interface NodeMessageSource {
  id: number;
  title: string | null;
  user?: { username?: string | null } | null;
}

export interface CommentMessageSource {
  id: number;
  nodeId: number | null;
  text: string | null;
  user?: { username?: string | null } | null;
  node?: { title?: string | null } | null;
}

/** A new node: linked title over the author. Previewed, so the cover shows. */
export const nodeMessage = (
  publicUrl: string,
  node: NodeMessageSource,
): TelegramMessage => ({
  text:
    `<a href="${escapeAttr(nodeUrl(publicUrl, node.id))}">${escapeHtml(
      node.title ?? '',
    )}</a>\n` + `~${escapeHtml(node.user?.username ?? '')}`,
  showPreview: true,
});

/** A new comment: author and linked node title, then the text when present. */
export const commentMessage = (
  publicUrl: string,
  comment: CommentMessageSource,
): TelegramMessage => {
  const url = commentUrl(publicUrl, comment.nodeId ?? 0, comment.id);
  const head =
    `<b>~${escapeHtml(comment.user?.username ?? '')}</b> к ` +
    `<a href="${escapeAttr(url)}">"${escapeHtml(comment.node?.title ?? '')}"</a>`;

  const separator = ':\n\n';
  const body = comment.text
    ? escapeWithin(
        comment.text,
        TELEGRAM_MAX_TEXT - head.length - separator.length,
      )
    : '';

  return plain(body ? `${head}${separator}${body}` : head);
};

/**
 * Groups messages per recipient for one delivery run.
 *
 * `items` must be newest first. Each recipient gets at most `max` of their
 * newest items, reordered oldest first so the chat reads chronologically.
 */
export const pickPerRecipient = <T extends { recipient: unknown }>(
  items: ReadonlyArray<T>,
  max: number,
): Map<T['recipient'], T[]> => {
  const picked = new Map<T['recipient'], T[]>();

  for (const item of items) {
    const list = picked.get(item.recipient) ?? [];

    if (list.length < max) {
      list.push(item);
      picked.set(item.recipient, list);
    }
  }

  for (const list of picked.values()) {
    list.reverse();
  }

  return picked;
};

/**
 * The command a message invokes, or null for anything else. Accepts the
 * `/start@botname` form Telegram uses in group chats, and ignores arguments.
 */
export const parseCommand = (text: string | undefined): string | null => {
  const match = /^\/([a-z]+)(?:@\w+)?(?:\s|$)/i.exec(text ?? '');

  return match ? match[1].toLowerCase() : null;
};
