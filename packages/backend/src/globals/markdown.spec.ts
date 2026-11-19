import { stripMarkdown } from './markdown';

describe('stripMarkdown', () => {
  it.each([
    ['plain text', 'plain text'],
    ['**bold** and *italic* and ~~gone~~', 'bold and italic and gone'],
    ['# Title\n\ntext', 'Title\n\ntext'],
    ['123\n456\n789', '123\n456\n789'],
    ['one\n\n\n\ntwo', 'one\n\ntwo'],
    ['[site](https://vault48.org)', 'site (https://vault48.org)'],
    ['<https://vault48.org>', 'https://vault48.org'],
    ['see https://vault48.org/a', 'see https://vault48.org/a'],
    ['![cat](https://x.org/cat.png)', 'https://x.org/cat.png'],
    ['`a < b` & c', 'a < b & c'],
    ['```\nconst a = 1;\n```', 'const a = 1;'],
    ['> quoted **text**', 'quoted text'],
    ['- one\n- two', '• one\n• two'],
    ['1. one\n2. two', '1. one\n2. two'],
    ['- [x] done\n- [ ] todo', '☑ done\n☐ todo'],
    ['a\n\n---\n\nb', 'a\n\n———\n\nb'],
    ['// grey comment', '// grey comment'],
    ['/*nospace*/ and /* a */', '/*nospace*/ and /* a */'],
    ['~username привет', '~username привет'],
    ['<b>html</b> stays text', 'html stays text'],
  ])('%j → %j', (input, expected) => {
    expect(stripMarkdown(input)).toBe(expected);
  });
});
