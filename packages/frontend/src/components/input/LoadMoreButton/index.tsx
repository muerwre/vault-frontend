import { FC } from 'react';

import { Button } from '~/components/input/Button';

import styles from './styles.module.scss';

interface LoadMoreButtonProps {
  isLoading: boolean;
  onClick?: () => void;
}

const LoadMoreButton: FC<LoadMoreButtonProps> = ({ isLoading, onClick }) => (
  <Button
    color="flat"
    onClick={onClick}
    stretchy
    className={styles.more}
    loading={isLoading}
  >
    Показать ещё комментарии
  </Button>
);

export { LoadMoreButton };
