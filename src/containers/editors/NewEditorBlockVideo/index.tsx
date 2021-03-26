import React, { FC, useCallback, useMemo } from 'react';
import { getYoutubeThumb } from '~/utils/dom';
import styles from './styles.module.scss';
import classnames from 'classnames';
import { InputText } from '~/components/input/InputText';
import { BlockType, IBlockComponentProps } from '~/redux/types';

const NewEditorBlockVideo: FC<IBlockComponentProps> = ({ block, handler }) => {
  const setUrl = useCallback((url: string) => handler({ type: BlockType.video, url }), [handler]);

  const url = block.url || '';
  const preview = useMemo(() => getYoutubeThumb(url), [url]);
  const backgroundImage = (preview && `url("${preview}")`) || '';

  return (
    <div className={styles.wrap}>
      <div className={styles.input_wrap}>
        <div className={classnames(styles.input, { active: !!preview })}>
          <InputText value={url} handler={setUrl} placeholder="Адрес видео" />
        </div>
      </div>

      <div className={styles.preview} style={{ backgroundImage }} />
    </div>
  );
};
export { NewEditorBlockVideo };
