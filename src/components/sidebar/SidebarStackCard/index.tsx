import React, { FC, useMemo } from 'react';
import styles from './styles.module.scss';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';

interface SidebarStackCardProps {
  width?: number;
  headerFeature?: 'back' | 'close';
  title?: string;
}

const SidebarStackCard: FC<SidebarStackCardProps> = ({ children, title, width, headerFeature }) => {
  const style = useMemo(() => ({ maxWidth: width, flexBasis: width }), [width]);

  return (
    <div style={style} className={styles.card}>
      {(headerFeature || title) && (
        <div className={styles.head}>
          <Filler>{!!title && <h5>{title}</h5>}</Filler>

          {headerFeature === 'back' && <Button color="link" iconRight="right" />}
          {headerFeature === 'close' && <Button color="link" iconRight="close" />}
        </div>
      )}

      <Filler>{children}</Filler>
    </div>
  );
};

export { SidebarStackCard };
