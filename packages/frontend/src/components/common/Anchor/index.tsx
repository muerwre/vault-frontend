import { VFC } from 'react';

import NextLink from 'next/link';
import { Link } from 'react-router-dom';

import { CONFIG } from '~/utils/config';
import { LinkProps } from '~/utils/types';

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
