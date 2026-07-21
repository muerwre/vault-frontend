import { FC, useCallback, useMemo } from 'react';

import classnames from 'classnames';

import { InputText } from '~/components/input/InputText';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { NodeEditorProps } from '~/types/node';
import { getYoutubeThumb } from '~/utils/dom';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

type Props = NodeEditorProps & {};

const VideoEditor: FC<Props> = () => {
  const { values, setFieldValue } = useNodeFormContext();

  const setUrl = useCallback(
    (url: string) => setFieldValue('blocks', [{ type: 'video', url }]),
    [setFieldValue],
  );

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
