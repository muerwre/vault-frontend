import { FC } from 'react';

import { IMAGE_BLOCK_MODES, ImageBlockMode } from '@vault/common/constants';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { UploadImageGrid } from '~/components/upload/UploadImageGrid';
import { UploadType } from '~/constants/uploads';
import { IBlockImages } from '~/types';
import { UploaderContextProvider } from '~/utils/context/UploaderContextProvider';

import { SubmitUploadCard } from '../../../SubmitUploadCard';
import { useBlockUploader } from '../../hooks/useBlockUploader';
import { BlockEditorProps } from '../../types';

import styles from './styles.module.scss';

const MODES: { mode: ImageBlockMode; label: string }[] = [
  { mode: IMAGE_BLOCK_MODES.GRID, label: 'Сетка' },
  { mode: IMAGE_BLOCK_MODES.SLIDER, label: 'Слайдер' },
];

/**
 * Photos uploaded like a photo post's, up to the block limit, and how the
 * post shows them: a grid, or a slider.
 */
const SubmitImagesBlock: FC<BlockEditorProps<IBlockImages>> = observer(
  ({ block, onChange, disabled, left }) => {
    const { uploader, isFull } = useBlockUploader(
      block,
      UploadType.Image,
      onChange,
      left,
    );

    return (
      <UploaderContextProvider value={uploader}>
        <div className={styles.wrap}>
          <div className={styles.modes}>
            {MODES.map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                className={classNames(styles.mode, {
                  [styles.active]: block.mode === mode,
                })}
                onClick={() => onChange((it) => ({ ...it, mode }))}
                disabled={disabled}
              >
                {label}
              </button>
            ))}
          </div>

          <UploadDropzone onUpload={uploader.uploadFiles}>
            <UploadImageGrid
              files={uploader.files}
              setFiles={uploader.setFiles}
              locked={uploader.pendingImages}
              compact
              trailing={
                !isFull && (
                  <SubmitUploadCard
                    type={UploadType.Image}
                    icon="photo_add"
                    label="Добавить"
                    variant="tile"
                  />
                )
              }
            />
          </UploadDropzone>
        </div>
      </UploaderContextProvider>
    );
  },
);

export { SubmitImagesBlock };
