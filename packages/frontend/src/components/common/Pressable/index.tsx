import { FC } from 'react';

import classNames from 'classnames';

import { ButtonProps } from '~/utils/types';

import styles from './styles.module.scss';

interface PressableProps extends ButtonProps {}

const Pressable: FC<PressableProps> = ({ children, ...rest }) => (
  <button {...rest} className={classNames(styles.pressable, rest.className)}>
    {children}
  </button>
);

export { Pressable };
