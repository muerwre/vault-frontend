import dynamic from 'next/dynamic';

import type { BorisSuperpowersProps } from './index';

export const BorisSuperPowersSSR = dynamic<BorisSuperpowersProps>(
  () =>
    import('~/containers/boris/BorisSuperpowers/index').then(
      (it) => it.BorisSuperpowers,
    ),
  {
    ssr: false,
    loading: () => <div />,
  },
);
