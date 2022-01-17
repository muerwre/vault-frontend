import React, { FC } from 'react';
import { Authorized } from '~/components/containers/Authorized';
import { SubmitBar } from '~/components/bars/SubmitBar';

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
