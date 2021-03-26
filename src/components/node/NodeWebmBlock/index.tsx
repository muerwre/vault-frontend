import React, { FC } from 'react';
import { INodeComponentProps } from '~/redux/node/constants';
import { VideoPlayer } from '~/components/media/VideoPlayer';
import { useNodeVideos } from '~/utils/hooks/node/useNodeVideos';
import { getURLFromString } from '~/utils/dom';

const NodeWebmBlock: FC<INodeComponentProps> = ({ node }) => {
  const videos = useNodeVideos(node);

  if (!videos || !videos.length) {
    return null;
  }

  return (
    <div>
      <VideoPlayer src={getURLFromString(videos[0].url)} />
    </div>
  );
};

export { NodeWebmBlock };
