import { FC } from 'react';

import classNames from 'classnames';
import { EllipsisVerticalIcon } from 'lucide-react';

import { ButtonProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends ButtonProps {}

const MenuDots: FC<Props> = ({ ...rest }) => (
  <button {...rest} className={classNames(styles.button, rest.className)}>
    <div className={styles.dots}>
      <EllipsisVerticalIcon size={24} />
    </div>
  </button>
);

export { MenuDots };
