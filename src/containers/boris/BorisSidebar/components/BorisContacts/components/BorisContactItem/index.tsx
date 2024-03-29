import { FC, ReactNode } from 'react';

import { Icon } from '~/components/common/Icon';
import { WithDescription } from '~/components/common/WithDescription';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  link: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

const BorisContactItem: FC<Props> = ({
  icon,
  title,
  subtitle,
  link,
  prefix,
  suffix,
}) => {
  return (
    <div>
      {prefix}
      <WithDescription
        icon={<Icon icon={icon} size={32} />}
        title={title}
        link={link}
        subtitle={subtitle}
      />
      {suffix}
    </div>
  );
};

export { BorisContactItem };
