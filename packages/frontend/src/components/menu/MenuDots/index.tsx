import { FC, ReactNode } from 'react';

import Tippy from '@tippyjs/react';
import classNames from 'classnames';
import { EllipsisVerticalIcon } from 'lucide-react';

import { ButtonProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends ButtonProps {
  /** An icon shown in the same pill, left of the dots, such as a status. */
  extraIcon?: ReactNode;
  /** Tooltip for `extraIcon`. */
  extraIconTooltip?: string;
}

const MenuDots: FC<Props> = ({ extraIcon, extraIconTooltip, ...rest }) => {
  const extra = !!extraIcon && (
    <span className={styles.extra}>{extraIcon}</span>
  );

  return (
    <button {...rest} className={classNames(styles.button, rest.className)}>
      <div className={classNames(styles.dots, { [styles.wide]: !!extraIcon })}>
        {extraIconTooltip && extra ? (
          <Tippy content={extraIconTooltip}>{extra}</Tippy>
        ) : (
          extra
        )}
        <EllipsisVerticalIcon size={24} />
      </div>
    </button>
  );
};

export { MenuDots };
