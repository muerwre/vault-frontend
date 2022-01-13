import React, { FC } from 'react';
import { createPortal } from 'react-dom';
import { Authorized } from '~/components/containers/Authorized';
import { SubmitBar } from '~/components/bars/SubmitBar';

interface IProps {
  prefix?: string;
  isLab?: boolean;
}

const SidebarRouter: FC<IProps> = ({ prefix = '', isLab }) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <Authorized>
      <SubmitBar isLab={isLab} />
    </Authorized>,
    document.body
  );
};

export { SidebarRouter };
