import React, { VFC } from 'react';
import { LabLayout } from '~/layouts/LabLayout';
import { LabProvider } from '~/utils/providers/LabProvider';

interface LabPageProps {}

const LabPage: VFC<LabPageProps> = () => (
  <LabProvider>
    <LabLayout />
  </LabProvider>
);

export default LabPage;
