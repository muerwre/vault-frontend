import { FC } from 'react';

import classNames from 'classnames';

import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';
import { getFileSrcSet } from '~/utils/srcset';

import styles from './styles.module.scss';

interface CommentImageGridProps {
  files: IFile[];
  onClick: (file: IFile) => void;
}

const singleSrcSet = '(max-width: 1024px) 40vw, 20vw';
const multipleSrcSet = '(max-width: 1024px) 50vw, 20vw';

const CommentImageGrid: FC<CommentImageGridProps> = ({ files, onClick }) => {
  return (
    <div
      className={classNames(styles.images, {
        [styles.multiple]: files.length > 1,
      })}
    >
      {files.map((file) => (
        <img
          key={file.id}
          className={styles.item}
          onClick={() => onClick(file)}
          srcSet={getFileSrcSet(file)}
          src={getURL(file, imagePresets['300'])}
          alt={file.name}
          sizes={files.length > 1 ? singleSrcSet : multipleSrcSet}
        />
      ))}
    </div>
  );
};

export { CommentImageGrid };
