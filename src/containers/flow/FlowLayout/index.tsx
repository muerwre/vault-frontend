import * as React from 'react';
import { MainLayout } from "~/containers/main/MainLayout";
import { TestGrid } from "~/components/flow/TestGrid";
// const style = require('./style.scss');

export const FlowLayout = () => (
  <div className="default_container content_container">
    <TestGrid />
  </div>
);
