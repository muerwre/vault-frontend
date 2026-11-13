import { FC, useMemo } from 'react';

import { Placeholder } from '~/components/placeholders/Placeholder';
import { NodeComponentProps } from '~/constants/node';
import { getYoutubeId } from '~/utils/dom';

import styles from './styles.module.scss';

/**
 * A video post in the lab: its first video, embedded full width. A post with
 * several shows only the first here; the rest are on the post itself.
 */
const LabVideo: FC<NodeComponentProps> = ({ node, isLoading }) => {
  const id = useMemo(() => {
    const block = (node.blocks || []).find(
      (it) => it.type === 'video' && getYoutubeId(it.url),
    );

    return block?.type === 'video' ? getYoutubeId(block.url) : null;
  }, [node.blocks]);

  return (
    <Placeholder active={isLoading} width="100%" height={400}>
      {!!id && (
        <div className={styles.frame}>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${id}`}
            frameBorder="0"
            allowFullScreen
            title={node.title || 'video'}
          />
        </div>
      )}
    </Placeholder>
  );
};

export { LabVideo };
