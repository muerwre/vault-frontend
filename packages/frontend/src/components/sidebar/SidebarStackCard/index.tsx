import { FC, ReactNode, useMemo } from 'react';

import { Filler } from '~/components/common/Filler';
import { Button } from '~/components/input/Button';

import styles from './styles.module.scss';

interface SidebarStackCardProps {
  width?: number;
  headerFeature?: 'back' | 'close';
  title?: ReactNode;
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
          <Filler className={styles.title}>
            {typeof title === 'string' ? <h6>{title}</h6> : title}
          </Filler>

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
