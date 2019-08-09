import * as React from 'react';

import classNames = require('classnames');

const style = require('./style.scss');

interface IInfoProps {
  text?: string;
  children?: string;
  level?: string;
}
export const Info: React.FunctionComponent<IInfoProps> = ({
  text,
  children,
  level = 'normal',
}) => (
  <div className={classNames(style.container, { [level]: true })}>
    {
      text || children || ''
    }
  </div>
);
