import React, { FC } from 'react';

import { SubmitBar } from '~/components/bars/SubmitBar';
import { Authorized } from '~/components/containers/Authorized';

interface IProps {
  prefix?: string;
  isLab?: boolean;
}

const SidebarRouter: FC<IProps> = ({ isLab }) => (
  <Authorized>
    <SubmitBar isLab={isLab} />
  </Authorized>
);

export { SidebarRouter };
