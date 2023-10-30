import React, { FC, useCallback } from 'react';

import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import { Dialog } from '~/constants/modal';
import { useShowModal } from '~/hooks/modal/useShowModal';

import styles from './styles.module.scss';

const FlowLoginStamp = () => {
  const showModal = useShowModal(Dialog.Login);

  const onClick = useCallback(() => showModal({}), []);

  return (
    <div className={styles.stamp}>
      <Filler />

      <div className={styles.content}>
        <h2>Привет, друг</h2>
        <p>Ночь темна и полна опасностей, не желаешь ли войти?</p>
        <Button
          stretchy
          color="outline-white"
          className={styles.button}
          onClick={onClick}
        >
          Впустите меня!
        </Button>
      </div>
    </div>
  );
};

export { FlowLoginStamp };
