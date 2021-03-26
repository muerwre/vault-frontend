import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Button } from '~/components/input/Button';

interface IProps {}

const NewEditorBetweenBlocks: FC<IProps> = () => {
  return (
    <div className={styles.buttons}>
      <div className={styles.buttons_content}>
        <Button iconLeft="plus" round />
      </div>
    </div>
  );
};

export { NewEditorBetweenBlocks };
