import * as React from 'react';
import { MainLayout } from "$containers/MainLayout";
import { HeroPlaceholder } from "$components/flow/HeroPlaceholder";
import { TestGrid } from "$components/flow/TestGrid";
// const style = require('./style.scss');

export const FlowLayout = () => (
  <MainLayout>
    <div className="default_container content_container">
      <TestGrid />
    </div>
  </MainLayout>
);
