import React, { FC } from "react";
import { createPortal } from "react-dom";
import { Route, Switch } from "react-router";
import { TagSidebar } from "~/containers/sidebars/TagSidebar";
import { ProfileSidebar } from "~/containers/sidebars/ProfileSidebar";
import { Authorized } from "~/components/containers/Authorized";
import { SubmitBar } from "~/components/bars/SubmitBar";
import { EditorCreateDialog } from "~/containers/dialogs/EditorCreateDialog";

interface IProps {
  prefix?: string;
  isLab?: boolean;
}

const SidebarRouter: FC<IProps> = ({ prefix = '', isLab }) => {
  return createPortal(
    <>
      <Switch>
        <Route path={`${prefix}/create/:type`} component={EditorCreateDialog} />
        <Route path={`${prefix}/tag/:tag`} component={TagSidebar} />
        <Route path={`${prefix}/~:username`} component={ProfileSidebar} />
      </Switch>

      <Authorized>
        <SubmitBar isLab={isLab} />
      </Authorized>
    </>,
    document.body
  );
};

export { SidebarRouter };
