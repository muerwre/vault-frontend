import React, { FC } from 'react';

import { SubmitBarSSR } from '~/components/bars/SubmitBar/ssr';
import { Authorized } from '~/components/containers/Authorized';

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
