import {
  CSSProperties,
  ReactNode,
  forwardRef,
  useMemo,
  useReducer,
} from 'react';

import classNames from 'classnames';

import { LoaderCircle } from '~/components/common/LoaderCircle';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface ImageLoadingWrapperProps extends Omit<DivProps, 'children'> {
  children: (props: { loading: boolean; onLoad: () => void }) => ReactNode;
  preview?: string;
}

const ImageLoadingWrapper = forwardRef<
  HTMLDivElement,
  ImageLoadingWrapperProps
>(({ className, children, preview, color, ...props }, ref) => {
  const [loading, onLoad] = useReducer(() => false, true);

  const style = useMemo<CSSProperties>(
    () => ({
      backgroundImage: `url('${preview}')`,
      backgroundColor: color || 'var(--color-primary)',
    }),
    [preview, color],
  );

  return (
    <div className={classNames(styles.wrapper, className)} {...props} ref={ref}>
      {!!loading && !!preview && (
        <div className={styles.preview}>
          <div className={styles.thumbnail} style={style} />
          <LoaderCircle size={32} />
        </div>
      )}
      {children({ loading, onLoad })}
    </div>
  );
});

export { ImageLoadingWrapper };
