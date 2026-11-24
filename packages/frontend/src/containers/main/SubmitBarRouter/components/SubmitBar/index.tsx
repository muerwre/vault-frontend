import { FC, useCallback, useState } from 'react';

import classNames from 'classnames';
import {
  EighthNotesIcon,
  FlaskConicalIcon,
  ImageIcon,
  PlusIcon,
  RectangleLandscapePlayIcon,
  TextAlignStartIcon,
} from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { useStartNodeSubmission } from '~/hooks/node/useStartNodeSubmission';

import styles from './styles.module.scss';

export interface SubmitBarProps {
  isLab?: boolean;
}

const SubmitBar: FC<SubmitBarProps> = observer(({ isLab }) => {
  const startSubmission = useStartNodeSubmission();
  const [focused, setFocused] = useState(false);

  const onFocus = useCallback(() => setFocused(true), [setFocused]);
  const onBlur = useCallback(() => setFocused(false), [setFocused]);

  const createUrl = useCallback(
    (type: string) => () => {
      startSubmission(type, !!isLab);
    },
    [isLab, startSubmission],
  );

  const SubmitIcon = isLab ? FlaskConicalIcon : PlusIcon;

  return (
    <div className={classNames(styles.wrap, { [styles.lab]: isLab })}>
      <div className={classNames(styles.panel, { [styles.active]: focused })}>
        <button onClick={createUrl('image')} className={styles.link}>
          <ImageIcon size={26} />
        </button>

        <button onClick={createUrl('text')} className={styles.link}>
          <TextAlignStartIcon size={26} />
        </button>

        <button onClick={createUrl('video')} className={styles.link}>
          <RectangleLandscapePlayIcon size={26} />
        </button>

        <button onClick={createUrl('audio')} className={styles.link}>
          <EighthNotesIcon size={26} />
        </button>
      </div>

      <button
        className={styles.button}
        onFocus={onFocus}
        onBlur={onBlur}
        type="button"
      >
        <SubmitIcon size={26} />
      </button>
    </div>
  );
});

export { SubmitBar };
