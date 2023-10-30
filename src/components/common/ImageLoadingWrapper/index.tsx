import React, {
  CSSProperties,
  FC,
  useMemo,
  useReducer,
} from 'react';

import classNames from 'classnames';

import { LoaderCircle } from '~/components/input/LoaderCircle';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface ImageLoadingWrapperProps extends Omit<DivProps, 'children'> {
  children: (props: { loading: boolean; onLoad: () => void }) => void;
  preview?: string;
}

const ImageLoadingWrapper: FC<ImageLoadingWrapperProps> = ({
  className,
  children,
  preview,
  color,
  ...props
}) => {
  const [loading, onLoad] = useReducer((v) => false, true);

  const style = useMemo<CSSProperties>(
    () => ({
      backgroundImage: `url('${preview}')`,
      backgroundColor: color || 'var(--color-primary)',
    }),
    [preview, color],
  );

  return (
    <div className={classNames(styles.wrapper, className)} {...props}>
      {!!loading && !!preview && (
        <div className={styles.preview}>
          <div className={styles.thumbnail} style={style} />
          <LoaderCircle size={32} />
        </div>
      )}
      {children({ loading, onLoad })}
    </div>
  );
};

export { ImageLoadingWrapper };
