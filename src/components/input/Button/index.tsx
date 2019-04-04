import * as React from 'react';

const style = require('./style.scss');

interface IButtonProps {
  children?: string,
  label?: string,

  onClick?: React.MouseEventHandler,
}

export const Button: React.FunctionComponent<IButtonProps> = ({
  children,
  label,
  onClick = () => {},
}) => (
  <div className={style.container} onClick={onClick}>
    {label || children || ''}
  </div>
);
