import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

type ToggleColor = 'primary' | 'secondary' | 'lab' | 'danger';

interface IProps {
  value?: boolean;
  handler?: (val: boolean) => void;
  color?: ToggleColor;
}

const Toggle: FC<IProps> = ({ value, handler, color = 'primary' }) => {
  const onClick = useCallback(() => {
    if (!handler) {
      return;
    }

    handler(!value);
  }, [value, handler]);

  return (
    <button
      type="button"
      className={classNames(styles.toggle, { [styles.active]: value }, styles[color])}
      onClick={onClick}
    />
  );
};

export { Toggle };
