import { FC, ReactElement } from 'react';

import classNames from 'classnames';

import { Markdown } from '~/components/common/Markdown';
import { getPhotoBackdrop } from '~/utils/color';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends DivProps {
  children: string;
  heading: string | ReactElement;
  color?: string;
}

const FlowCellText: FC<Props> = ({ children, heading, color, ...rest }) => {
  return (
    <div
      {...rest}
      className={classNames(styles.text, rest.className)}
      style={getPhotoBackdrop(color)}
    >
      {heading && <div className={styles.heading}>{heading}</div>}
      <Markdown className={styles.description}>{children}</Markdown>
    </div>
  );
};

export { FlowCellText };
