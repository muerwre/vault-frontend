import { FC, SVGAttributes } from 'react';

import { IIcon } from '~/types';

type IProps = SVGAttributes<SVGElement> & {
  size?: number;
  icon: IIcon;
};

export const Icon: FC<IProps> = ({ size = 20, icon, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid slice"
    style={{ ...style, outline: 'none' }}
    {...props}
  >
    <use xlinkHref={`#${icon}`} />
  </svg>
);
