import React, { ChangeEvent, FC, useCallback, useEffect } from 'react';
import styles from './styles.module.scss';
import { UploadSubject, UploadTarget, UploadType } from '~/constants/uploads';
import { getURL } from '~/utils/dom';
import { Icon } from '~/components/input/Icon';
import { PRESETS } from '~/constants/urls';
import { IEditorComponentProps } from '~/types/node';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { getFileType } from '~/utils/uploader';
import { useUploader } from '~/hooks/data/useUploader';

type IProps = IEditorComponentProps & {};

const EditorUploadCoverButton: FC<IProps> = () => {
  const { values, setFieldValue } = useNodeFormContext();
  const { uploadFile, files, pendingImages } = useUploader(
    UploadSubject.Editor,
    UploadTarget.Nodes,
    values.cover ? [values.cover] : []
  );

  const background = values.cover ? getURL(values.cover, PRESETS['300']) : null;
  const preview = pendingImages?.[0]?.thumbnail || '';

  const onDropCover = useCallback(() => {
    setFieldValue('cover', null);
  }, [setFieldValue]);

  const onInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])
        .filter(file => getFileType(file) === UploadType.Image)
        .slice(0, 1);

      const result = await uploadFile(files[0]);
      setFieldValue('cover', result);
    },
    [uploadFile, setFieldValue]
  );

  useEffect(() => {
    if (!files.length) {
      return;
    }

    setFieldValue('cover', files[files.length - 1]);
  }, [files, setFieldValue]);

  return (
    <div className={styles.wrap}>
      <div
        className={styles.preview}
        style={{ backgroundImage: `url("${preview || background}")` }}
      >
        <div className={styles.input}>
          {!values.cover && <span>ОБЛОЖКА</span>}
          <input type="file" accept="image/*" onChange={onInputChange} />
        </div>

        {values.cover && (
          <div className={styles.button} onClick={onDropCover}>
            <Icon icon="close" />
          </div>
        )}
      </div>
    </div>
  );
};

export { EditorUploadCoverButton };
