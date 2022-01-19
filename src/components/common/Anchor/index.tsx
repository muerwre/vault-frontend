import React, { VFC } from 'react';
import { LinkProps } from '~/utils/types';
import { CONFIG } from '~/utils/config';
import NextLink from 'next/link';
import { Link } from 'react-router-dom';

interface AnchorProps extends LinkProps {}

const Anchor: VFC<AnchorProps> = ({ ref, href, children, ...rest }) =>
  CONFIG.isNextEnvironment ? (
    <NextLink href={href ?? ''} passHref>
      <a {...rest}>{children}</a>
    </NextLink>
  ) : (
    <Link {...rest} to={href ?? ''} />
  );

export { Anchor };
