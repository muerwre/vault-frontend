import React, { FC } from 'react';
import { SWRConfig, SWRConfiguration } from 'swr';

const config: SWRConfiguration = {
  revalidateOnFocus: false,
};

export const SWRProvider: FC = ({ children }) => <SWRConfig value={config}>{children}</SWRConfig>;
