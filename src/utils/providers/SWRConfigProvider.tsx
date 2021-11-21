import React, { FC } from 'react';
import { SWRConfig, SWRConfiguration } from 'swr';

const config: SWRConfiguration = {
  revalidateOnFocus: false,
};

export const SWRConfigProvider: FC = ({ children }) => (
  <SWRConfig value={config}>{children}</SWRConfig>
);
