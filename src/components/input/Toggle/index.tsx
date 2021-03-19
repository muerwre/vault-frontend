import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

interface IProps {
  value?: boolean;
  handler?: (val: boolean) => void;
}

const Toggle: FC<IProps> = ({ value, handler }) => {
  const onClick = useCallback(() => {
    if (!handler) {
      return;
    }

    handler(!value);
  }, [value, handler]);

  return (
    <button
      type="button"
      className={classNames(styles.toggle, { [styles.active]: value })}
      onClick={onClick}
    />
  );
};

export { Toggle };
