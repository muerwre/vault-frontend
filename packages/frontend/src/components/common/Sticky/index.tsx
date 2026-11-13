import { DetailsHTMLAttributes, FC } from 'react';

import StickyBox from 'react-sticky-box';

interface Props extends DetailsHTMLAttributes<HTMLDivElement> {
  offsetTop?: number;
}

const Sticky: FC<Props> = ({ children, offsetTop = 65 }) => (
  <StickyBox offsetTop={offsetTop} offsetBottom={10}>
    {children}
  </StickyBox>
);

export { Sticky };
