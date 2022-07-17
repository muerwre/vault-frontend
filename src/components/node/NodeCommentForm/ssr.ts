import dynamic from 'next/dynamic';

import type { NodeCommentFormProps } from './index';

export const NodeCommentFormSSR = dynamic<NodeCommentFormProps>(
  () => import('./index').then(it => it.NodeCommentForm),
  { ssr: false }
);
