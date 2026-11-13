import { FC } from 'react';

import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { UploadType } from '~/constants/uploads';
import { ImageGrid } from '~/containers/dialogs/EditorDialog/components/ImageGrid';
import { NodeEditorProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';
import { values } from '~/utils/ramda';

import { SubmitUploadCard } from '../SubmitUploadCard';

/** Photo node content: the photo grid, ending in a card that adds more. */
const SubmitImageEditor: FC<NodeEditorProps> = () => {
  const { pending, files, setFiles, uploadFiles } = useUploaderContext()!;

  return (
    <UploadDropzone onUpload={uploadFiles}>
      <ImageGrid
        files={files}
        setFiles={setFiles}
        locked={values(pending)}
        trailing={
          <SubmitUploadCard
            type={UploadType.Image}
            icon="photo_add"
            label="Добавить"
            variant="tile"
          />
        }
      />
    </UploadDropzone>
  );
};

export { SubmitImageEditor };
