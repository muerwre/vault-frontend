import { MouseEvent, useCallback } from 'react';

import { useNavigation } from '~/hooks/navigation/useNavigation';

/**
 * Formatted text is set as raw HTML, so its `@username` links would reload the
 * page. This click handler routes them inside the app instead, leaving
 * modified clicks (new tab and the like) to the browser.
 */
export const useMentionClicks = () => {
  const { push } = useNavigation();

  return useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const link = (event.target as HTMLElement).closest?.('a.username');
      const href = link?.getAttribute('href');

      if (
        !href ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      void push(href);
    },
    [push],
  );
};
