import { FC, useCallback, useRef } from 'react';

import { PhotoUploadPill } from '~/components/upload/PhotoUploadPill';
import { UploadSubject, UploadTarget } from '~/constants/uploads';
import { imagePresets } from '~/constants/urls';
import { useUploader } from '~/hooks/data/useUploader';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

/** The node's cover: a preview of the picked image; clicking it picks one. */
const SubmitCoverEditor: FC = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = useCallback(() => inputRef.current?.click(), []);
  const { uploadFile } = useUploader(
    UploadSubject.Editor,
    UploadTarget.Nodes,
    [],
  );

  const onUpload = useCallback(
    async (file: File) => {
      const result = await uploadFile(file);

      if (result) {
        setFieldValue('cover', result);
      }
    },
    [uploadFile, setFieldValue],
  );

  const onDelete = useCallback(
    () => setFieldValue('cover', null),
    [setFieldValue],
  );

  const background = values.cover
    ? `url("${getURL(values.cover, imagePresets['600'])}")`
    : undefined;

  return (
    <div
      className={styles.wrap}
      style={{ backgroundImage: background }}
      onClick={openPicker}
    >
      {!values.cover && <span className={styles.label}>Фон</span>}

      <PhotoUploadPill
        hasPhoto={!!values.cover}
        onUpload={onUpload}
        onDelete={onDelete}
        uploadTitle="Загрузить фон"
        deleteTitle="Убрать фон"
        className={styles.pill}
        inputRef={inputRef}
      />
    </div>
  );
};

export { SubmitCoverEditor };
