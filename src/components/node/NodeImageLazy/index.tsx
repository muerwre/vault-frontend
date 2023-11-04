import { FC, ImgHTMLAttributes } from 'react';

import Image from 'next/future/image';

interface NodeImageLazyProps extends ImgHTMLAttributes<HTMLImageElement> {
  color?: string;
  quality?: number;
  onLoad?: () => void;
}

/** Separates SVG-s and raster images to be used in NodeImageSwiperBlock */
const NodeImageLazy: FC<NodeImageLazyProps> = ({
  src,
  color,
  onLoad,
  width,
  height,
  sizes,
  quality,
  ...rest
}) => {
  if (src?.endsWith('svg')) {
    return (
      <img data-src={src} onLoad={onLoad} color={color} alt="" {...rest} />
    );
  }

  if (!src) {
    return null;
  }

  return (
    <Image
      width={width}
      height={height}
      src={src}
      onLoadingComplete={onLoad}
      color={color}
      alt=""
      sizes={sizes}
      quality={quality}
      {...rest}
      placeholder="empty"
      loading="lazy"
    />
  );
};

export { NodeImageLazy };
