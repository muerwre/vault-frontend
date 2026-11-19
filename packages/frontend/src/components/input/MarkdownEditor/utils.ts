import { MarkdownFormatter } from './types';

const HEADING_PREFIX = /^#{1,6}\s+/;

/**
 * The change of a line's heading prefix that gives it the level: replace the
 * first `length` chars with `insert`. Asking for the level the line already
 * has makes it plain text again, so heading buttons work as toggles.
 */
export const getHeadingChange = (
  line: string,
  level: number,
): { length: number; insert: string } => {
  const prefix = line.match(HEADING_PREFIX)?.[0] ?? '';
  const current = prefix.trim().length;

  return {
    length: prefix.length,
    insert: level > 0 && level !== current ? `${'#'.repeat(level)} ` : '',
  };
};

/** Formatter of the plain textarea shown until the editor loads. */
export const createTextareaFormatter = (
  target: HTMLTextAreaElement,
  onChange: (value: string) => void,
): MarkdownFormatter => {
  const replace = (
    from: number,
    to: number,
    insert: string,
    selection: [number, number],
  ) => {
    onChange(
      target.value.substring(0, from) + insert + target.value.substring(to),
    );
    target.focus();

    // the new value reaches the textarea on the next render
    setTimeout(() => target.setSelectionRange(...selection), 0);
  };

  return {
    wrap: (prefix, suffix = '') => {
      const { selectionStart: from, selectionEnd: to, value } = target;
      const inner = from + prefix.length;

      replace(from, to, prefix + value.substring(from, to) + suffix, [
        inner,
        inner + to - from,
      ]);
    },

    setHeading: (level) => {
      const { selectionStart, selectionEnd, value } = target;
      const from = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const lineEnd = value.indexOf('\n', selectionEnd);
      const to = lineEnd === -1 ? value.length : lineEnd;

      const lines = value
        .substring(from, to)
        .split('\n')
        .map((line) => {
          const { length, insert } = getHeadingChange(line, level);
          return insert + line.substring(length);
        })
        .join('\n');

      replace(from, to, lines, [from + lines.length, from + lines.length]);
    },

    focus: () => target.focus(),
  };
};
