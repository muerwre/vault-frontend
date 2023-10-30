import dynamic from 'next/dynamic';

import type { Props } from './index';

export const NodeCommentFormSSR = dynamic<Props>(
  () => import('./index').then((it) => it.NodeCommentForm),
  { ssr: false },
);
