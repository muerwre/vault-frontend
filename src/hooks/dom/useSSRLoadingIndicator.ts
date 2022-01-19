import { useEffect, useState } from 'react';

import Router from 'next/router';

/** decides to show loader on SSR loading */
export const useSSRLoadingIndicator = (delay = 0) => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let timeout;

    const show = () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        setShown(true);
      }, delay);
    };

    const hide = () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      setShown(false);
    };

    Router.events.on('routeChangeStart', show);
    Router.events.on('routeChangeComplete', hide);
    Router.events.on('routeChangeError', hide);
  }, []);

  return shown;
};
