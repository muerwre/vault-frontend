import { FC } from 'react';

import { Authorized } from '~/components/common/Authorized';

import { SubmitBarSSR } from './components/SubmitBar/ssr';

interface Props {
  prefix?: string;
  isLab?: boolean;
}

const SubmitBarRouter: FC<Props> = ({ isLab }) => (
  <Authorized>
    <SubmitBarSSR isLab={isLab} />
  </Authorized>
);

export { SubmitBarRouter };
