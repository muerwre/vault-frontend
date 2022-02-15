import React, { FC, useMemo } from 'react';

import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';

import styles from './styles.module.scss';

interface SidebarStackCardProps {
  width?: number;
  headerFeature?: 'back' | 'close';
  title?: string;
  onBackPress?: () => void;
}

const SidebarStackCard: FC<SidebarStackCardProps> = ({
  children,
  title,
  width,
  headerFeature,
  onBackPress,
}) => {
  const style = useMemo(() => ({ maxWidth: width, flexBasis: width }), [width]);
  const backIcon = headerFeature === 'close' ? 'close' : 'right';

  return (
    <div style={style} className={styles.card}>
      {!!(headerFeature || title) && (
        <div className={styles.head}>
          <Filler>{!!title && <h6>{title}</h6>}</Filler>

          {!!(headerFeature && onBackPress) && (
            <Button color="link" iconRight={backIcon} onClick={onBackPress} />
          )}
        </div>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export { SidebarStackCard };
