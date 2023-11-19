import React, { FC } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

interface LoginStaticSceneProps {
  scene?: 'clouds' | 'nowhere';
}

const LoginStaticScene: FC<LoginStaticSceneProps> = ({ scene = 'login' }) => (
  <div className={classNames(styles.scene, styles[scene])} />
);

export { LoginStaticScene };
