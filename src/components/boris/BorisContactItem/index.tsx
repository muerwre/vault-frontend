import React, { FC, ReactNode, useCallback } from 'react';

import { WithDescription } from '~/components/common/WithDescription';
import { Icon } from '~/components/input/Icon';

import styles from './styles.module.scss';

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
  const onClick = useCallback(() => {
    if (!link) return;

    window.open(link);
  }, []);

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
