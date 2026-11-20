import { FC } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { UploadAudioGrid } from '~/components/upload/UploadAudioGrid';
import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { UploadType } from '~/constants/uploads';
import { IBlockAudio } from '~/types';
import { UploaderContextProvider } from '~/utils/context/UploaderContextProvider';

import { SubmitPickButton } from '../../../SubmitPickButton';
import { useBlockUploader } from '../../hooks/useBlockUploader';
import { BlockEditorProps } from '../../types';

import styles from './styles.module.scss';

/** A track list, uploaded like a song post's but without covers. */
const SubmitAudioBlock: FC<BlockEditorProps<IBlockAudio>> = observer(
  ({ block, onChange, left }) => {
    const { uploader, isFull } = useBlockUploader(
      block,
      UploadType.Audio,
      onChange,
      left,
    );

    const isEmpty = !uploader.files.length && !uploader.pendingAudios.length;

    return (
      <UploaderContextProvider value={uploader}>
        <UploadDropzone onUpload={uploader.uploadFiles}>
          <UploadAudioGrid
            outlined
            files={uploader.files}
            setFiles={uploader.setFiles}
            locked={uploader.pendingAudios}
            trailing={
              !isFull && (
                <div
                  className={classNames(styles.pick, {
                    // alone in an empty block, the button takes its middle
                    [styles.center]: isEmpty,
                  })}
                >
                  <SubmitPickButton
                    type={UploadType.Audio}
                    iconLeft="audio"
                    label="Добавить песню"
                  />
                </div>
              )
            }
          />
        </UploadDropzone>
      </UploaderContextProvider>
    );
  },
);

export { SubmitAudioBlock };
