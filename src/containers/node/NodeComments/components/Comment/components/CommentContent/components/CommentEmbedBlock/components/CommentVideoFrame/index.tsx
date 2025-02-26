import classNames from 'classnames';
import { useResizeDetector } from 'react-resize-detector';

import styles from './styles.module.scss';

interface Props {
  id: string;
  title: string;
  className?: string;
}

export const CommentVideoFrame = ({ id, title, className }: Props) => {
  const { ref, width = 0, height = 0 } = useResizeDetector();

  return (
    <div className={classNames(styles.wrap, className)} ref={ref}>
      <iframe
        width={width}
        height={height}
        src={`https://www.youtube.com/embed/${id}?autoplay=1`}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        frameBorder="0"
        allowFullScreen
        title={title}
      />
    </div>
  );
};
