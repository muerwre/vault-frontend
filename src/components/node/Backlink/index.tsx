import React, { FC } from 'react';

import { Icon } from '~/components/common/Icon';
import { WithDescription } from '~/components/common/WithDescription';

interface BacklinkProps {
  icon?: string;
  title: string;
  subtitle?: string;
  link: string;
}

const Backlink: FC<BacklinkProps> = ({ icon, title, subtitle, link }) => (
  <WithDescription
    title={title}
    subtitle={subtitle}
    icon={icon && <Icon icon={icon} />}
    link={link}
  />
);

export { Backlink };
