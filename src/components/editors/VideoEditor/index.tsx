import React, { FC, useCallback, useMemo } from "react";
import styles from "./styles.module.scss";
import { path } from "ramda";
import { InputText } from "~/components/input/InputText";
import classnames from "classnames";
import { getYoutubeThumb } from "~/utils/dom";
import { NodeEditorProps } from "~/types/node";
import { useNodeFormContext } from "~/hooks/node/useNodeFormFormik";

type IProps = NodeEditorProps & {};

const VideoEditor: FC<IProps> = () => {
  const { values, setFieldValue } = useNodeFormContext();

  const setUrl = useCallback((url: string) => setFieldValue('blocks', [{ type: 'video', url }]), [
    setFieldValue,
  ]);

  const url = (path(['blocks', 0, 'url'], values) as string) || '';
  const preview = useMemo(() => getYoutubeThumb(url), [url]);
  const backgroundImage = (preview && `url("${preview}")`) || '';

  return (
    <div className={styles.preview} style={{ backgroundImage }}>
      <div className={styles.input_wrap}>
        <div className={classnames(styles.input, { active: !!preview })}>
          <InputText value={url} handler={setUrl} placeholder="Адрес видео" />
        </div>
      </div>
    </div>
  );
};

export { VideoEditor };
