import { useEffect } from 'react';
import { history } from '~/redux/store';

/**
 * useBlockBackButton - blocks back navigation and calls {callback}
 * @param callback
 */
export const useBlockBackButton = (callback?: () => void) => {
  useEffect(
    () =>
      history.listen((newLocation, action) => {
        if (action !== 'POP') {
          return;
        }

        history.goForward();

        if (callback) {
          callback();
        }
      }),
    [callback, history]
  );
};
