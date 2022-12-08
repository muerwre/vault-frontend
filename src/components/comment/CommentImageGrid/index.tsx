import React, { FC, useMemo } from 'react';

import classNames from 'classnames';
import Image from 'next/future/image';
import Gallery, { ImageWithSize } from 'react-easy-image-gallery';

import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';
import { getFileSrcSet } from '~/utils/srcset';

import styles from './styles.module.scss';

interface CommentImageGridProps {
  files: IFile[];
}

const singleSrcSet = '(max-width: 1024px) 40vw, 20vw';
const multipleSrcSet = '(max-width: 1024px) 50vw, 20vw';

const CommentImageGrid: FC<CommentImageGridProps> = ({ files }) => {
  return (
    <div
      className={classNames(styles.images, {
        [styles.multiple]: files.length > 1,
      })}
    >
      {files.map((file, index) => (
        <div
          key={file.id}
          // onClick={() => onShowImageModal(groupped.image, index)}
        >
          <img
            srcSet={getFileSrcSet(file)}
            src={getURL(file, imagePresets['300'])}
            alt={file.name}
            className={styles.image}
            sizes={files.length > 1 ? singleSrcSet : multipleSrcSet}
          />
        </div>
      ))}
    </div>
  );
};

export { CommentImageGrid };
