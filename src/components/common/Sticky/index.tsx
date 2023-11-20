import { DetailsHTMLAttributes, FC } from 'react';

import StickyBox from 'react-sticky-box';

interface IProps extends DetailsHTMLAttributes<HTMLDivElement> {
  offsetTop?: number;
}

const Sticky: FC<IProps> = ({ children, offsetTop = 65 }) => (
  <StickyBox offsetTop={offsetTop} offsetBottom={10}>
    {children}
  </StickyBox>
);

export { Sticky };
