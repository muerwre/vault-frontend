import React, { forwardRef, ForwardRefRenderFunction, VFC } from 'react';
import styles from './styles.module.scss';
import { DivProps } from '~/utils/types';
import classNames from 'classnames';

interface SquareProps extends DivProps {
  image: string;
  size?: number;
}

const Square = forwardRef<HTMLDivElement, SquareProps>(({ image, size, ...rest }, ref) => {
  const backgroundImage = image ? `url('${image}')` : undefined;

  return (
    <div
      {...rest}
      className={classNames(styles.wrapper, rest.className)}
      style={{ backgroundImage, width: size }}
      ref={ref}
    >
      <svg className={styles.svg} viewBox="0 0 1 1" />
    </div>
  );
});

export { Square };