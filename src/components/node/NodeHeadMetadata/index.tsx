import React, { VFC } from 'react';

import Head from 'next/head';

import { PageTitle } from '~/components/common/PageTitle';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { getURLFromString } from '~/utils/dom';
import { getPageTitle } from '~/utils/ssr/getPageTitle';

interface NodeHeadMetadataProps {}

const NodeHeadMetadata: VFC<NodeHeadMetadataProps> = () => {
  const { node } = useNodeContext();

  return (
    <>
      <PageTitle title={getPageTitle(node.title)} />

      <Head>
        <meta property="og:title" content={node.title} />
        <meta property="og:type" content={node.type} />
        <meta property="og:image" content={getURLFromString(node.thumbnail)} />
        <meta property="og:image:secure_url" content={getURLFromString(node.thumbnail)} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:alt" content={node.description} />
        <meta property="og:description" content={node.description} />
      </Head>
    </>
  );
};

export { NodeHeadMetadata };
