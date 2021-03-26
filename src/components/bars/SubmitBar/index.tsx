import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Icon } from '~/components/input/Icon';
import { nodeCreate } from '~/redux/node/actions';

import styles from './styles.module.scss';
import { NODE_TYPES } from '~/redux/node/constants';
import classNames from 'classnames';

interface Props {
  isLab?: boolean;
}

const SubmitBar: FC<Props> = ({ isLab }) => {
  const dispatch = useDispatch();

  const onOpenImageEditor = useCallback(() => dispatch(nodeCreate(NODE_TYPES.IMAGE, isLab)), [
    dispatch,
  ]);

  const onOpenTextEditor = useCallback(() => dispatch(nodeCreate(NODE_TYPES.TEXT, isLab)), [
    dispatch,
  ]);

  const onOpenVideoEditor = useCallback(() => dispatch(nodeCreate(NODE_TYPES.VIDEO, isLab)), [
    dispatch,
  ]);

  const onOpenAudioEditor = useCallback(() => dispatch(nodeCreate(NODE_TYPES.AUDIO, isLab)), [
    dispatch,
  ]);

  return (
    <div className={classNames(styles.wrap, { [styles.lab]: isLab })}>
      <div className={styles.panel}>
        <div onClick={onOpenImageEditor}>
          <Icon icon="image" />
        </div>

        <div onClick={onOpenTextEditor}>
          <Icon icon="text" />
        </div>

        <div onClick={onOpenVideoEditor}>
          <Icon icon="video" />
        </div>

        <div onClick={onOpenAudioEditor}>
          <Icon icon="audio" />
        </div>
      </div>

      <div className={styles.button}>
        <Icon icon="plus" />
      </div>
    </div>
  );
};

export { SubmitBar };
