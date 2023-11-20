import React, { FC, HTMLAttributes } from 'react';

import styles from './styles.module.scss';

type IProps = HTMLAttributes<HTMLDivElement> & {};

const TagField: FC<IProps> = ({ children }) => <div className={styles.wrap}>{children}</div>;

export { TagField };
