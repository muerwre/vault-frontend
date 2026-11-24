import { FC, ReactNode } from 'react';

import { WithDescription } from '~/components/common/WithDescription';

interface BacklinkProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  link: string;
}

const Backlink: FC<BacklinkProps> = ({ icon, title, subtitle, link }) => (
  <WithDescription title={title} subtitle={subtitle} icon={icon} link={link} />
);

export { Backlink };
