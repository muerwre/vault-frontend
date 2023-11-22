import { FC, SVGAttributes } from 'react';

import { IIcon } from '~/types';

type Props = SVGAttributes<SVGElement> & {
  size?: number;
  icon: IIcon;
};

export const Icon: FC<Props> = ({ size = 20, icon, style, ...props }) => (
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
