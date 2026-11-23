import { FC, useMemo } from 'react';

import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getPhotoShade } from '~/utils/color';
import { getURL } from '~/utils/dom';
import { getFileSrcSet } from '~/utils/srcset';

import styles from './styles.module.scss';

interface Props {
  file: IFile;
  onClick: (file: IFile) => void;
}

/**
 * A block's only photo, as tall as a slider's at most. Where it leaves room at
 * its sides, the photo itself fills it, blurred under a dark shade of its
 * colour, as on a post's card. A click opens the viewer.
 */
const SinglePhoto: FC<Props> = ({ file, onClick }) => {
  const shade = useMemo(
    () => getPhotoShade(file.metadata?.dominant_color),
    [file.metadata?.dominant_color],
  );

  return (
    <div
      className={styles.wrap}
      style={{
        backgroundImage: `url("${getURL(file, imagePresets['300'])}")`,
      }}
    >
      <div className={styles.shade} style={shade} />

      <img
        className={styles.image}
        srcSet={getFileSrcSet(file)}
        src={getURL(file, imagePresets['1600'])}
        sizes="(max-width: 1024px) 100vw, 50vw"
        alt={file.name}
        loading="lazy"
        // known before loading, so the block keeps its height meanwhile
        style={
          file.metadata?.width && file.metadata?.height
            ? {
                aspectRatio: `${file.metadata.width} / ${file.metadata.height}`,
              }
            : undefined
        }
        onClick={() => onClick(file)}
      />
    </div>
  );
};

export { SinglePhoto };
