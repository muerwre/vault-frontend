import React, { VFC } from 'react';
import { LinkProps } from '~/utils/types';
import { CONFIG } from '~/utils/config';
import NextLink from 'next/link';
import { Link } from 'react-router-dom';

interface AnchorProps extends LinkProps {}

const Anchor: VFC<AnchorProps> = ({ ref, href, ...rest }) =>
  CONFIG.isNextEnvironment ? (
    <NextLink {...rest} href={href ?? ''} />
  ) : (
    <Link {...rest} to={href ?? ''} />
  );

export { Anchor };
