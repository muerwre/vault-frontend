import { FC, useCallback } from 'react';

import classNames from 'classnames';

import { ButtonProps } from '~/utils/types';

import styles from './styles.module.scss';

type ToggleColor = 'primary' | 'secondary' | 'lab' | 'danger' | 'white';

type Props = Omit<ButtonProps, 'value' | 'color'> & {
  value?: boolean;
  handler?: (val: boolean) => void;
  color?: ToggleColor;
};

const Toggle: FC<Props> = ({ value, handler, color = 'primary', ...rest }) => {
  const onClick = useCallback(() => {
    if (!handler) {
      return;
    }

    handler(!value);
  }, [value, handler]);

  return (
    <button
      {...rest}
      type="button"
      className={classNames(
        styles.toggle,
        { [styles.active]: value },
        styles[color],
        rest.className,
      )}
      onClick={onClick}
    />
  );
};

export { Toggle };
