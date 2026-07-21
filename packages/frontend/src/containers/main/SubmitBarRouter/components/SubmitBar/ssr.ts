import dynamic from 'next/dynamic';

import type { SubmitBarProps } from './index';

export const SubmitBarSSR = dynamic<SubmitBarProps>(
  () => import('./index').then((it) => it.SubmitBar),
  { ssr: false },
);
