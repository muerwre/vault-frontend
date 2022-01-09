import React, { FC } from 'react';
import { createPortal } from 'react-dom';
import { Route, Switch } from 'react-router';
import { TagSidebar } from '~/containers/sidebars/TagSidebar';
import { Authorized } from '~/components/containers/Authorized';
import { SubmitBar } from '~/components/bars/SubmitBar';

interface IProps {
  prefix?: string;
  isLab?: boolean;
}

const SidebarRouter: FC<IProps> = ({ prefix = '', isLab }) => {
  return createPortal(
    <Authorized>
      <SubmitBar isLab={isLab} />
    </Authorized>,
    document.body
  );
};

export { SidebarRouter };
