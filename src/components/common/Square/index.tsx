import { forwardRef } from 'react';

import classNames from 'classnames';

import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface SquareProps extends DivProps {
  image?: string;
  size?: number;
}

const Square = forwardRef<HTMLDivElement, SquareProps>(
  ({ image, size, children, ...rest }, ref) => {
    const backgroundImage = image ? `url('${image}')` : undefined;

    return (
      <div
        {...rest}
        className={classNames(styles.wrapper, rest.className)}
        style={{ backgroundImage, width: size, height: size, flexBasis: size }}
        ref={ref}
      >
        <svg className={styles.svg} viewBox="0 0 1 1" />
        {!!children && <div className={styles.content}>{children}</div>}
      </div>
    );
  },
);

export { Square };
