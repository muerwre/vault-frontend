import { FC, useMemo } from 'react';

import { NodeComponentProps } from '~/constants/node';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

interface Props extends NodeComponentProps {}

const NodeVideoBlock: FC<Props> = ({ node }) => {
  const video = useMemo(() => {
    const url: string = path(['blocks', 0, 'url'], node) || '';
    const match =
      url &&
      url.match(
        /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?[\w?=]*)?/,
      );

    return match && match[1];
  }, [node]);

  return (
    <div className={styles.wrap}>
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${video}`}
        frameBorder="0"
        allowFullScreen
        title="video"
      />
    </div>
  );
};

export { NodeVideoBlock };
