import { useCallback } from 'react';

import { Filler } from '~/components/common/Filler';
import { Button } from '~/components/input/Button';
import { Dialog } from '~/constants/modal';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useShowModal } from '~/hooks/modal/useShowModal';

import styles from './styles.module.scss';

const FlowLoginStamp = () => {
  const showModal = useShowModal(Dialog.Login);

  const onClick = useCallback(() => showModal({}), [showModal]);
  const { isTablet } = useWindowSize();

  return (
    <div className={styles.stamp} onClick={onClick}>
      <Filler />

      <div className={styles.content}>
        <h2>Привет, друг</h2>
        <p>Ночь темна и полна опасностей, не желаешь ли войти?</p>
        <Button
          stretchy
          color="outline-white"
          className={styles.button}
          size={isTablet ? 'small' : 'normal'}
        >
          Впустите!
        </Button>
      </div>
    </div>
  );
};

export { FlowLoginStamp };
