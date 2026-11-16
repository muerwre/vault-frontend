import { FC, useMemo } from 'react';

import { Placeholder } from '~/components/placeholders/Placeholder';
import { NodeComponentProps } from '~/constants/node';
import { imagePresets } from '~/constants/urls';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { getYoutubeId, getYoutubeThumbById } from '~/utils/dom';

import styles from './styles.module.scss';

/**
 * A video post in the lab: its first video's cover, cropped to 16:9 and
 * opening the post like any other picture. A post with several shows only
 * the first here; the rest are on the post itself.
 */
const LabVideo: FC<NodeComponentProps> = ({ node, isLoading }) => {
  const onClick = useGotoNode(node.id);

  const id = useMemo(() => {
    const block = (node.blocks || []).find(
      (it) => it.type === 'video' && getYoutubeId(it.url),
    );

    return block?.type === 'video' ? getYoutubeId(block.url) : null;
  }, [node.blocks]);

  return (
    <Placeholder active={isLoading} width="100%" height={400}>
      {!!id && (
        <div className={styles.wrapper}>
          <img
            src={getYoutubeThumbById(id, imagePresets[600])}
            // the title is right below; alt text would only flash over the box
            alt=""
            className={styles.image}
            onClick={onClick}
            loading="lazy"
          />
        </div>
      )}
    </Placeholder>
  );
};

export { LabVideo };
