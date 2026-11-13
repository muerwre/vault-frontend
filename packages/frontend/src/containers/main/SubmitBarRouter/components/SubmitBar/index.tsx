import { FC, useCallback, useState } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/common/Icon';
import { Dialog } from '~/constants/modal';
import { useShowModal } from '~/hooks/modal/useShowModal';

import styles from './styles.module.scss';

export interface SubmitBarProps {
  isLab?: boolean;
}

const SubmitBar: FC<SubmitBarProps> = ({ isLab }) => {
  const showModal = useShowModal(Dialog.CreateNode);
  const [focused, setFocused] = useState(false);

  const onFocus = useCallback(() => setFocused(true), [setFocused]);
  const onBlur = useCallback(() => setFocused(false), [setFocused]);

  const createUrl = useCallback(
    (type: string) => () => {
      showModal({ type, isInLab: !!isLab });
    },
    [isLab, showModal],
  );

  const icon = isLab ? 'lab' : 'plus';

  return (
    <div className={classNames(styles.wrap, { [styles.lab]: isLab })}>
      <div className={classNames(styles.panel, { [styles.active]: focused })}>
        <button onClick={createUrl('image')} className={styles.link}>
          <Icon icon="image" size={32} />
        </button>

        <button onClick={createUrl('text')} className={styles.link}>
          <Icon icon="text" size={32} />
        </button>

        <button onClick={createUrl('video')} className={styles.link}>
          <Icon icon="video" size={32} />
        </button>

        <button onClick={createUrl('audio')} className={styles.link}>
          <Icon icon="audio" size={32} />
        </button>
      </div>

      <button
        className={styles.button}
        onFocus={onFocus}
        onBlur={onBlur}
        type="button"
      >
        <Icon icon={icon} />
      </button>
    </div>
  );
};

export { SubmitBar };
