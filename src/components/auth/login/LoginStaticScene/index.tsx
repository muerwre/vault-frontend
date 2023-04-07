import React, { FC } from 'react';

import styles from './styles.module.scss';

interface LoginStaticSceneProps {}

const LoginStaticScene: FC<LoginStaticSceneProps> = () => (
  <div className={styles.scene} />
);

export { LoginStaticScene };
