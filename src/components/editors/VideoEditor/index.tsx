import React, { FC, useCallback, useMemo } from 'react';
import { BlockType } from '~/redux/types';
import styles from './styles.module.scss';
import { path } from 'ramda';
import { InputText } from '~/components/input/InputText';
import classnames from 'classnames';
import { getYoutubeThumb } from '~/utils/dom';
import { NodeEditorProps } from '~/redux/node/types';

type IProps = NodeEditorProps & {};

const VideoEditor: FC<IProps> = ({ data, setData }) => {
  const setUrl = useCallback(
    (url: string) => setData({ ...data, blocks: [{ type: BlockType.video, url }] }),
    [data, setData]
  );

  const url = (path(['blocks', 0, 'url'], data) as string) || '';
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
