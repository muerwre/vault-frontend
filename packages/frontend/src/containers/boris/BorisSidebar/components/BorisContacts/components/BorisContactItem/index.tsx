import { FC, ReactNode } from 'react';

import { WithDescription } from '~/components/common/WithDescription';

interface Props {
  icon: ReactNode;
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
        icon={icon}
        title={title}
        link={link}
        subtitle={subtitle}
      />
      {suffix}
    </div>
  );
};

export { BorisContactItem };
