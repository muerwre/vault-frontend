import React, { FC } from 'react';

import classNames from 'classnames';

import styles from '~/components/flow/FlowCell/styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { ButtonProps } from '~/utils/types';

interface Props extends ButtonProps {}

const MenuDots: FC<Props> = ({ ...rest }) => (
  <button {...rest} className={classNames(styles.button, rest.className)}>
    <div className={styles.dots}>
      <Icon icon="menu" size={24} />
    </div>
  </button>
);

export { MenuDots };
