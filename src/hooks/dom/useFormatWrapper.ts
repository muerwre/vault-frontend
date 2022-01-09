import { useCallback } from 'react';

/** wraps text inside textarea with tags */
export const useFormatWrapper = (onChange: (val: string) => void) => {
  return useCallback(
    (
      target: HTMLTextAreaElement,

      prefix = '',
      suffix = ''
    ) => event => {
      event.preventDefault();
      wrapTextInsideInput(target, prefix, suffix, onChange);
    },
    [onChange]
  );
};

/** wraps text inside textarea with tags */
export const wrapTextInsideInput = (
  target: HTMLTextAreaElement,
  prefix: string,
  suffix: string,
  onChange: (val: string) => void
) => {
  if (!target) return;

  const start = target.selectionStart;
  const end = target.selectionEnd;
  const selection = target.value.substring(start, end);

  const replacement = prefix + selection + suffix;

  onChange(
    target.value.substring(0, start) +
      replacement +
      target.value.substring(end, target.value.length)
  );

  target.focus();

  setTimeout(() => {
    if (start === end) {
      target.selectionEnd = end + prefix.length;
    } else {
      target.selectionEnd = end + prefix.length + suffix.length;
    }
  }, 0);
};
