import React, { memo, useCallback, useMemo } from "react";
import { IFile } from "~/redux/types";
import classNames from "classnames";
import styles from "./styles.module.scss";
import { Icon } from "~/components/input/Icon";
import { InputText } from "~/components/input/InputText";
import { PlayerState } from "~/constants/player";
import { useAudioPlayer } from "~/utils/providers/AudioPlayerProvider";

type Props = {
  file: IFile;
  isEditing?: boolean;
  onDelete?: (id: IFile['id']) => void;
  onTitleChange?: (file_id: IFile['id'], title: string) => void;
};

const AudioPlayer = memo(({ file, onDelete, isEditing, onTitleChange }: Props) => {
  const { toPercent, file: currentFile, setFile, play, status, progress, pause } = useAudioPlayer();

  const onPlay = useCallback(async () => {
    if (file.id !== currentFile?.id) {
      setFile(file);
      setTimeout(() => void play(), 0);
      return;
    }

    status === PlayerState.PLAYING ? pause() : await play();
  }, [play, pause, setFile, file, currentFile, status]);

  const onSeek = useCallback(
    event => {
      event.stopPropagation();
      const { clientX, target } = event;
      const { left, width } = target.getBoundingClientRect();
      toPercent(((clientX - left) / width) * 100);
    },
    [toPercent]
  );

  const onDropClick = useCallback(() => {
    if (!onDelete) return;

    onDelete(file.id);
  }, [file, onDelete]);

  const title = useMemo(
    () =>
      (file.metadata &&
        (file.metadata.title ||
          [file.metadata.id3artist, file.metadata.id3title].filter(el => el).join(' - '))) ||
      file.orig_name ||
      '',
    [file.metadata, file.orig_name]
  );

  const onRename = useCallback(
    (val: string) => {
      if (!onTitleChange) return;

      onTitleChange(file.id, val);
    },
    [onTitleChange, file.id]
  );

  const playing = currentFile?.id === file.id;

  return (
    <div onClick={onPlay} className={classNames(styles.wrap, { [styles.playing]: playing })}>
      {onDelete && (
        <div className={styles.drop} onMouseDown={onDropClick}>
          <Icon icon="close" />
        </div>
      )}

      <div className={styles.playpause}>
        {playing && status === PlayerState.PLAYING ? <Icon icon="pause" /> : <Icon icon="play" />}
      </div>

      {isEditing ? (
        <div className={styles.input}>
          <InputText
            placeholder={title}
            handler={onRename}
            value={file.metadata && file.metadata.title}
          />
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.title}>{title || ''}</div>

          <div className={styles.progress} onClick={onSeek}>
            <div className={styles.bar} style={{ width: `${progress.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
});

export { AudioPlayer };
