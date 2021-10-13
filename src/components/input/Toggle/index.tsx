import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { ButtonProps, DivProps } from '~/utils/types';

type ToggleColor = 'primary' | 'secondary' | 'lab' | 'danger' | 'white';

type IProps = Omit<ButtonProps, 'value' | 'color'> & {
  value?: boolean;
  handler?: (val: boolean) => void;
  color?: ToggleColor;
};

const Toggle: FC<IProps> = ({ value, handler, color = 'primary', ...rest }) => {
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
        rest.className
      )}
      onClick={onClick}
    />
  );
};

export { Toggle };
