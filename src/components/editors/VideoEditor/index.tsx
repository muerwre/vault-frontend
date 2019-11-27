import React, { FC, useCallback, useMemo } from 'react';
import { INode } from '~/redux/types';
import * as styles from './styles.scss';
import path from 'ramda/es/path';
import { InputText } from '~/components/input/InputText';
import classnames from 'classnames';
import { getYoutubeThumb } from '~/utils/dom';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
}

const VideoEditor: FC<IProps> = ({ data, setData }) => {
  const setUrl = useCallback(
    (url: string) => setData({ ...data, blocks: [{ type: 'video', url }] }),
    [data, setData]
  );

  const url = (path(['blocks', 0, 'url'], data) as string) || '';
  const preview = useMemo(() => getYoutubeThumb(url), [url]);

  return (
    <div className={styles.preview} style={{ backgroundImage: preview && `url("${preview}")` }}>
      <div className={styles.input_wrap}>
        <div className={classnames(styles.input, { active: !!preview })}>
          <InputText value={url} handler={setUrl} placeholder="Адрес видео" />
        </div>
      </div>
    </div>
  );
};

export { VideoEditor };
