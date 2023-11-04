import { FC } from 'react';

import Image from 'next/future/image';

import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { normalizeBrightColor } from '~/utils/color';
import { getURL } from '~/utils/dom';

interface NodeImageLazyProps {
  className?: string;
  file: IFile;
  onLoad?: () => void;
  onClick?: () => void;
}

/** Separates SVG-s and raster images to be used in NodeImageSwiperBlock */
const NodeImageLazy: FC<NodeImageLazyProps> = ({
  file,
  onLoad,
  className,
  onClick,
}) => {
  if (file.url.endsWith('svg')) {
    return (
      <img
        data-src={getURL(file)}
        className={className}
        onClick={onClick}
        onLoad={onLoad}
        color={normalizeBrightColor(file?.metadata?.dominant_color)}
        alt=""
      />
    );
  }

  return (
    <Image
      src={getURL(file, imagePresets[1200])}
      width={file.metadata?.width}
      height={file.metadata?.height}
      onLoadingComplete={onLoad}
      onClick={onClick}
      className={className}
      color={normalizeBrightColor(file?.metadata?.dominant_color)}
      alt=""
      sizes="100vw"
      quality={90}
    />
  );
};

export { NodeImageLazy };
