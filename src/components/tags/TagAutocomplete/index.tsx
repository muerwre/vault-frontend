import React, { FC } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

interface IProps {}

const TagAutocomplete: FC<IProps> = () => <div className={classNames(styles.window)}>auto</div>;

export { TagAutocomplete };
