import React, { useEffect, useRef, VFC } from 'react';

interface ImgProps
  extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  onLoad?: () => void;
}

/** fixes the situation when img not fires onLoad at SSR */
const ImageWithSSRLoad: VFC<ImgProps> = ({ onLoad, ...rest }) => {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!ref.current?.complete || !onLoad) return;
    onLoad();
  }, [ref, onLoad]);

  return <img {...rest} onLoad={onLoad} alt={rest.alt} ref={ref} />;
};

export { ImageWithSSRLoad };
