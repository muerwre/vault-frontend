import React, { FC, useCallback, useMemo } from "react";
import { UploadType } from "~/constants/uploads";
import { ImageGrid } from "../ImageGrid";
import { AudioGrid } from "../AudioGrid";
import styles from "./styles.module.scss";
import { NodeEditorProps } from "~/types/node";
import { useNodeImages } from "~/hooks/node/useNodeImages";
import { useNodeAudios } from "~/hooks/node/useNodeAudios";
import { useNodeFormContext } from "~/hooks/node/useNodeFormFormik";
import { UploadDropzone } from "~/components/upload/UploadDropzone";
import { useUploaderContext } from "~/utils/context/UploaderContextProvider";
import { values } from "ramda";

type IProps = NodeEditorProps;

const AudioEditor: FC<IProps> = () => {
  const formik = useNodeFormContext();
  const { pending, setFiles, uploadFiles } = useUploaderContext()!;

  const images = useNodeImages(formik.values);
  const audios = useNodeAudios(formik.values);

  const pendingImages = useMemo(
    () => values(pending).filter(item => item.type === UploadType.Image),
    [pending]
  );

  const pendingAudios = useMemo(
    () => values(pending).filter(item => item.type === UploadType.Audio),
    [pending]
  );

  const setImages = useCallback(values => setFiles([...values, ...audios]), [setFiles, audios]);

  const setAudios = useCallback(values => setFiles([...values, ...images]), [setFiles, images]);

  return (
    <UploadDropzone onUpload={uploadFiles} helperClassName={styles.dropzone}>
      <div className={styles.wrap}>
        <ImageGrid files={images} setFiles={setImages} locked={pendingImages} />
        <AudioGrid files={audios} setFiles={setAudios} locked={pendingAudios} />
      </div>
    </UploadDropzone>
  );
};

export { AudioEditor };
