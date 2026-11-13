import { createElement, FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

interface Props extends HTMLAttributes<HTMLElement> {
  /** A label makes the whole card open a file input placed inside it. */
  as?: 'div' | 'label';
}

/**
 * The shell shared by the submission page's add cards (photos, songs, videos):
 * the same background and shadow as the Фон area. Sizing is up to the caller.
 */
const SubmitCard: FC<Props> = ({ as = 'div', className, ...props }) =>
  createElement(as, {
    ...props,
    className: classNames(styles.card, className),
  });

export { SubmitCard };
