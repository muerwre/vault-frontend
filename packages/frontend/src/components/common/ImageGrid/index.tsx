import { FC } from 'react';

import classNames from 'classnames';
import { ZoomInIcon } from 'lucide-react';

import { Hoverable } from '~/components/common/Hoverable';
import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';
import { getFileSrcSet } from '~/utils/srcset';

import styles from './styles.module.scss';

interface ImageGridProps {
  files: IFile[];
  onClick: (file: IFile) => void;
}

// several photos share a row, so each is drawn smaller than a lone one
const multipleSizes = '(max-width: 1024px) 40vw, 20vw';
const singleSizes = '(max-width: 1024px) 50vw, 20vw';

const ImageGrid: FC<ImageGridProps> = ({ files, onClick }) => {
  return (
    <div
      className={classNames(styles.images, {
        [styles.multiple]: files.length > 1,
      })}
    >
      {files.map((file) => (
        <Hoverable
          key={file.id}
          onClick={() => onClick(file)}
          className={styles.item}
          icon={<ZoomInIcon size={30} />}
        >
          <img
            srcSet={getFileSrcSet(file)}
            src={getURL(file, imagePresets['300'])}
            alt={file.name}
            className={styles.image}
            sizes={files.length > 1 ? multipleSizes : singleSizes}
          />
        </Hoverable>
      ))}
    </div>
  );
};

export { ImageGrid };
