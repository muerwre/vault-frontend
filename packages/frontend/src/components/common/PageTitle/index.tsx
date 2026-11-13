import { VFC } from 'react';

import Head from 'next/head';

interface PageTitleProps {
  title: string;
}

const PageTitle: VFC<PageTitleProps> = ({ title }) => (
  <Head>
    <title>{title}</title>
  </Head>
);

export { PageTitle };
