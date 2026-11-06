import { BORIS_NODE_ID } from '@vault/common/constants';

import {
  commentMessage,
  commentUrl,
  escapeHtml,
  escapeWithin,
  greetingMessage,
  helpMessage,
  nodeMessage,
  nodeUrl,
  parseCommand,
  pickPerRecipient,
  startedMessage,
  TELEGRAM_MAX_TEXT,
  type TelegramMessage,
  unauthorizedMessage,
} from './telegram.messages';

const SITE = 'https://vault48.example';

describe('telegram messages', () => {
  describe('urls', () => {
    it('links nodes as /post<id>', () => {
      expect(nodeUrl(SITE, 12)).toBe(`${SITE}/post12`);
    });

    it('links the Boris node as /boris', () => {
      expect(nodeUrl(SITE, BORIS_NODE_ID)).toBe(`${SITE}/boris`);
    });

    it('anchors comments to their id', () => {
      expect(commentUrl(SITE, 12, 99)).toBe(`${SITE}/post12#comment-99`);
    });

    it('does not anchor Boris comments', () => {
      expect(commentUrl(SITE, BORIS_NODE_ID, 99)).toBe(`${SITE}/boris`);
    });
  });

  describe('escapeHtml', () => {
    it('escapes the three characters Telegram HTML mode rejects', () => {
      expect(escapeHtml('a < b && c > d')).toBe('a &lt; b &amp;&amp; c &gt; d');
    });

    it('leaves plain text alone', () => {
      expect(escapeHtml('привет, мир')).toBe('привет, мир');
    });
  });

  describe('escapeWithin', () => {
    it('returns short text escaped and uncut', () => {
      expect(escapeWithin('a&b', 100)).toBe('a&amp;b');
    });

    it('cuts to the budget measured after escaping', () => {
      const out = escapeWithin('&'.repeat(100), 21);

      expect(out.length).toBeLessThanOrEqual(21);
      expect(out.endsWith('…')).toBe(true);
    });

    it('never splits an entity', () => {
      const out = escapeWithin('&'.repeat(100), 23);

      expect(out.replace(/&amp;/g, '')).toBe('…');
    });
  });

  describe('nodeMessage', () => {
    it('links the title over the author and shows a preview', () => {
      expect(
        nodeMessage(SITE, { id: 5, title: 'Title', user: { username: 'bob' } }),
      ).toEqual({
        text: `<a href="${SITE}/post5">Title</a>\n~bob`,
        showPreview: true,
      });
    });

    it('escapes the title and username', () => {
      const { text } = nodeMessage(SITE, {
        id: 5,
        title: '<b>x</b>',
        user: { username: 'a&b' },
      });

      expect(text).toContain('&lt;b&gt;x&lt;/b&gt;');
      expect(text).toContain('~a&amp;b');
    });

    it('tolerates a missing author and title', () => {
      expect(nodeMessage(SITE, { id: 5, title: null, user: null }).text).toBe(
        `<a href="${SITE}/post5"></a>\n~`,
      );
    });
  });

  describe('commentMessage', () => {
    const comment = {
      id: 7,
      nodeId: 5,
      text: 'hello',
      user: { username: 'bob' },
      node: { title: 'Post' },
    };

    it('heads the text with author and linked node title', () => {
      expect(commentMessage(SITE, comment)).toEqual({
        text: `<b>~bob</b> к <a href="${SITE}/post5#comment-7">"Post"</a>:\n\nhello`,
        showPreview: false,
      });
    });

    it('omits the body when the comment has no text', () => {
      expect(commentMessage(SITE, { ...comment, text: '' }).text).toBe(
        `<b>~bob</b> к <a href="${SITE}/post5#comment-7">"Post"</a>`,
      );
    });

    it('escapes the body', () => {
      expect(
        commentMessage(SITE, { ...comment, text: '1 < 2' }).text,
      ).toContain('1 &lt; 2');
    });

    it('stays within the Telegram limit for the longest comment', () => {
      const { text } = commentMessage(SITE, {
        ...comment,
        text: '<'.repeat(8192),
        node: { title: '&'.repeat(255) },
        user: { username: '>'.repeat(255) },
      });

      expect(text.length).toBeLessThanOrEqual(TELEGRAM_MAX_TEXT);
    });

    it('links Boris comments to the Boris page', () => {
      expect(
        commentMessage(SITE, { ...comment, nodeId: BORIS_NODE_ID }).text,
      ).toContain(`href="${SITE}/boris"`);
    });
  });

  describe('service messages', () => {
    it('help links the site and the notification settings', () => {
      const { text } = helpMessage(SITE);

      expect(text).toContain(`href="${SITE}"`);
      expect(text).toContain(
        `href="${SITE}/?sidebar=settings&amp;page=notifications"`,
      );
      expect(text).toContain('/start');
      expect(text).toContain('/stop');
    });

    it('unauthorized links the profile settings', () => {
      expect(unauthorizedMessage(SITE).text).toContain(
        `href="${SITE}/?sidebar=settings&amp;page=profile"`,
      );
    });

    it('started links the notification settings', () => {
      expect(startedMessage(SITE).text).toContain('page=notifications');
    });

    it('greets differently depending on whether delivery is on', () => {
      expect(greetingMessage(SITE, true).text).toContain('/stop');
      expect(greetingMessage(SITE, false).text).toContain('/start');
      expect(greetingMessage(SITE, false).text).not.toContain('href');
    });

    it('never previews service messages', () => {
      expect(helpMessage(SITE).showPreview).toBe(false);
      expect(greetingMessage(SITE, true).showPreview).toBe(false);
    });
  });

  describe('pickPerRecipient', () => {
    const msg = (text: string): TelegramMessage => ({
      text,
      showPreview: false,
    });

    it('keeps the newest few per recipient, oldest first', () => {
      const picked = pickPerRecipient(
        [
          { recipient: 1, message: msg('n4') },
          { recipient: 1, message: msg('n3') },
          { recipient: 2, message: msg('m1') },
          { recipient: 1, message: msg('n2') },
          { recipient: 1, message: msg('n1') },
        ],
        3,
      );

      expect(picked.get(1)?.map((m) => m.text)).toEqual(['n2', 'n3', 'n4']);
      expect(picked.get(2)?.map((m) => m.text)).toEqual(['m1']);
    });

    it('returns nothing for no input', () => {
      expect(pickPerRecipient([], 3).size).toBe(0);
    });
  });

  describe('parseCommand', () => {
    it.each([
      ['/start', 'start'],
      ['/STOP', 'stop'],
      ['/help please', 'help'],
      ['/start@vault_bot', 'start'],
      ['/start@vault_bot now', 'start'],
    ])('reads %s as %s', (input, expected) => {
      expect(parseCommand(input)).toBe(expected);
    });

    it.each([['hello'], [''], [undefined], ['start'], ['/'], [' /start']])(
      'reads %p as no command',
      (input) => {
        expect(parseCommand(input)).toBeNull();
      },
    );
  });
});
