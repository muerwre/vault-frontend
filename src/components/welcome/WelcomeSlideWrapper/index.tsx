import { FC, PropsWithChildren, useMemo } from 'react';

import styles from './styles.module.scss';

interface Props {
  background?: string;
  color?: string;
}

const WelcomeSlideWrapper: FC<PropsWithChildren<Props>> = ({
  children,
  color,
  background = '',
}) => {
  const style = useMemo(
    () =>
      background || color
        ? {
            backgroundImage: background && `url(${background})`,
            backgroundColor: color,
          }
        : undefined,
    [background, color],
  );
  return (
    <div className={styles.layout} style={style}>
      {children}
    </div>
  );
};
export { WelcomeSlideWrapper };
