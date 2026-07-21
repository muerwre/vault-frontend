import { FC, ReactElement } from 'react';

import classNames from 'classnames';
import { transparentize, darken, desaturate, getLuminance } from 'color2k';

import { Markdown } from '~/components/common/Markdown';
import { formatText } from '~/utils/dom';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends DivProps {
  children: string;
  heading: string | ReactElement;
  color?: string;
}

const FlowCellText: FC<Props> = ({ children, heading, color, ...rest }) => {
  const colorIsBright = !!color && getLuminance(color) > 0.4;

  const textColor = colorIsBright
    ? desaturate(darken(color, 0.5), 0.1)
    : undefined;

  return (
    <div
      {...rest}
      className={classNames(styles.text, rest.className)}
      style={{
        backgroundColor: color && transparentize(color, 0.5),
        color: textColor,
      }}
    >
      {heading && <div className={styles.heading}>{heading}</div>}
      <Markdown className={styles.description}>{formatText(children)}</Markdown>
    </div>
  );
};

export { FlowCellText };
