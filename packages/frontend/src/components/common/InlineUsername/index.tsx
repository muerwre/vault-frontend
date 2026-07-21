import { FC } from 'react';

import { useColorFromString } from '~/hooks/color/useColorFromString';

import styles from './styles.module.scss';

interface InlineUsernameProps {
  children: string;
}

const InlineUsername: FC<InlineUsernameProps> = ({ children }) => {
  const backgroundColor = useColorFromString(children);
  return (
    <span style={{ backgroundColor }} className={styles.username}>
      ~{children}
    </span>
  );
};

export { InlineUsername };
