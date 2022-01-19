import { useEffect, useState } from 'react';

import Router from 'next/router';

export const useSSRLoadingIndicator = () => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    Router.events.on('routeChangeStart', () => setShown(true));
    Router.events.on('routeChangeComplete', () => setShown(false));
    Router.events.on('routeChangeError', () => setShown(false));
  }, []);

  return shown;
};
