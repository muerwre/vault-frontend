import { marked } from 'marked';

type Token = marked.Token;

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
};

/** The lexer escapes text for HTML; plain text needs it back. */
const unescape = (text: string): string =>
  text.replace(/&(amp|lt|gt|quot|#39);/g, (_, name: string) => ENTITIES[name]);

const stripTags = (html: string): string => html.replace(/<[^>]*>/g, '');

const inline = (tokens: Token[] | undefined): string =>
  (tokens ?? []).map(inlineToken).join('');

const inlineToken = (token: Token): string => {
  switch (token.type) {
    case 'br':
      return '\n';

    case 'link': {
      const text = inline(token.tokens).trim();
      return !text || text === token.href
        ? token.href
        : `${text} (${token.href})`;
    }

    case 'image':
      return token.href;

    case 'html':
      return unescape(stripTags(token.text));

    default:
      return 'tokens' in token && token.tokens
        ? inline(token.tokens)
        : unescape('text' in token ? token.text : '');
  }
};

const blocks = (tokens: Token[], separator = '\n\n'): string =>
  tokens
    .map(block)
    .filter((it) => it !== '')
    .join(separator);

const block = (token: Token): string => {
  switch (token.type) {
    case 'space':
    case 'def':
      return '';

    case 'hr':
      return '———';

    case 'code':
      return token.text;

    case 'html':
      return unescape(stripTags(token.text)).trim();

    case 'blockquote':
      return blocks(token.tokens);

    case 'list':
      return token.items
        .map((item, index) => {
          const marker = item.task
            ? item.checked
              ? '☑'
              : '☐'
            : token.ordered
              ? `${(Number(token.start) || 1) + index}.`
              : '•';

          return `${marker} ${blocks(item.tokens, '\n')}`;
        })
        .join('\n');

    case 'table':
      return [token.header, ...token.rows]
        .map((row) => row.map((cell) => inline(cell.tokens)).join(' | '))
        .join('\n');

    default:
      return inlineToken(token);
  }
};

/**
 * Plain text of a markdown post or comment, for places that can't render it:
 * Telegram and VK. Parsed as the site renders it, every newline a line break.
 * Links keep their address, images become theirs, `// comments` stay as text.
 */
export const stripMarkdown = (text: string): string => {
  // the stars of `/* comments */` would otherwise be read as emphasis
  const source = text.replace(/\/\*([\s\S]*?)\*\//g, '/\\*$1\\*/');

  const tokens = marked.lexer(source, {
    ...marked.defaults,
    gfm: true,
    breaks: true,
  });

  return blocks(tokens)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
