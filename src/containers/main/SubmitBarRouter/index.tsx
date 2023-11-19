import React, { FC } from 'react';

import { Authorized } from '~/components/containers/Authorized';

import { SubmitBarSSR } from './components/SubmitBar/ssr';

interface IProps {
  prefix?: string;
  isLab?: boolean;
}

const SubmitBarRouter: FC<IProps> = ({ isLab }) => (
  <Authorized>
    <SubmitBarSSR isLab={isLab} />
  </Authorized>
);

export { SubmitBarRouter };
