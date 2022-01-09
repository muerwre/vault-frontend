import React, { FC } from 'react';
import styles from '~/components/flow/FlowCell/styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { ButtonProps } from '~/utils/types';
import classNames from 'classnames';

interface Props extends ButtonProps {}

const MenuDots: FC<Props> = ({ ...rest }) => (
  <button {...rest} className={classNames(styles.button, rest.className)}>
    <div className={styles.dots}>
      <Icon icon="menu" size={24} />
    </div>
  </button>
);

export { MenuDots };
