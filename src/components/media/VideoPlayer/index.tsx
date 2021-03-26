import React, { FC, useEffect, useRef } from 'react';
import videojs from 'video.js';

interface IProps {
  src: string;
}

const VideoPlayer: FC<IProps> = ({ src }) => {
  const element = useRef<HTMLVideoElement | null>(null);
  const player = useRef<videojs.Player>();

  useEffect(() => {
    if (!element.current) {
      return;
    }

    player.current = videojs(element.current, { src });

    return () => player.current?.dispose();
  }, [element.current]);

  return (
    <div>
      <video ref={element} src={src} controls width={320} height={240} />
    </div>
  );
};

export { VideoPlayer };
