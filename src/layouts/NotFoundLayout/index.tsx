import React, { useCallback, VFC } from 'react';

import { useRouter } from 'next/router';

import { Button } from '~/components/input/Button';
import { URLS } from '~/constants/urls';

import styles from './styles.module.scss';

interface NotFoundLayoutProps {}

const NotFoundLayout: VFC<NotFoundLayoutProps> = () => {
  const nextRouter = useRouter();
  const goHome = useCallback(() => nextRouter.replace(URLS.BASE), [nextRouter]);

  return (
    <div className={styles.background}>
      <div className={styles.wrap}>
        <div className={styles.block}>
          <div className={styles.text}>
            <h1>Потерян навсегда</h1>
            <p className={styles.caption}>Этой страницы никогда не существовало.</p>

            <Button
              color="outline-white"
              size="giant"
              className={styles.button}
              iconLeft="left"
              onClick={goHome}
            >
              Пойдём домой
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NotFoundLayout };
