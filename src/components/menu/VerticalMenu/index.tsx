import React, { PropsWithChildren } from 'react';

import classNames from 'classnames';

import { Card } from '~/components/containers/Card';
import { DivProps, LinkProps } from '~/utils/types';

import styles from './styles.module.scss';

interface VerticalMenuProps extends DivProps {
  appearance?: 'inset' | 'flat' | 'default';
}

interface VerticalMenuItemProps extends Omit<LinkProps, 'href'> {}

function VerticalMenu({
  children,
  appearance = 'default',
  ...props
}: PropsWithChildren<VerticalMenuProps>) {
  return (
    <Card {...props} className={classNames(styles.menu, styles[appearance], props.className)}>
      {children}
    </Card>
  );
}

VerticalMenu.Item = ({ ...props }: VerticalMenuItemProps) => (
  <a {...props} className={classNames(styles.item, props.className)} />
);

export { VerticalMenu };
