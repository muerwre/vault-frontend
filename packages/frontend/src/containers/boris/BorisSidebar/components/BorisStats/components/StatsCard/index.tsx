import { FC, ReactNode } from 'react';

import classNames from 'classnames';

import { Card, CardProps } from '~/components/common/Card';
import { Filler } from '~/components/common/Filler';
import { Group } from '~/components/common/Group';
import { SubTitle } from '~/components/common/SubTitle';

import styles from './styles.module.scss';

interface StatsCardProps extends CardProps {
  title?: string;
  total?: string | number;
  background?: ReactNode;
}

const StatsCard: FC<StatsCardProps> = ({
  children,
  title,
  background,
  total,
  ...props
}) => (
  <Card
    {...props}
    className={classNames(styles.card, props.className)}
    elevation={0}
  >
    <div className={styles.content}>
      {(!!title || !!total) && (
        <Group className={styles.title} horizontal>
          {!!title && (
            <Filler>
              <SubTitle>{title}</SubTitle>
            </Filler>
          )}
          {!!total && <SubTitle className={styles.total}>{total}</SubTitle>}
        </Group>
      )}

      {children}
    </div>

    {!!background && <div className={styles.background}>{background}</div>}
  </Card>
);

export { StatsCard };
