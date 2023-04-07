import { FC } from 'react';

import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { normalizeBrightColor } from '~/utils/color';
import { getURL } from '~/utils/dom';
import { getFileSrcSet } from '~/utils/srcset';

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
        data-src={getURL(file, imagePresets[1600])}
        className={className}
        onClick={onClick}
        onLoad={onLoad}
        color={normalizeBrightColor(file?.metadata?.dominant_color)}
        alt=""
      />
    );
  }

  return (
    <img
      data-srcset={getFileSrcSet(file)}
      width={file.metadata?.width}
      height={file.metadata?.height}
      onLoad={onLoad}
      onClick={onClick}
      className={className}
      color={normalizeBrightColor(file?.metadata?.dominant_color)}
      alt=""
      sizes="(max-width: 560px) 100vw, 50vh"
    />
  );
};

export { NodeImageLazy };
