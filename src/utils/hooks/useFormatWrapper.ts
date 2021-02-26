import { MouseEventHandler, useCallback } from 'react';

export const useFormatWrapper = (
  target: HTMLTextAreaElement,
  onChange: (val: string) => void,
  prefix = '',
  suffix = ''
) => {
  return useCallback<MouseEventHandler>(
    event => {
      event.preventDefault();

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
    },
    [target, onChange, prefix, suffix]
  );
};
