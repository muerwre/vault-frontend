import React, { FC } from 'react';
import styles from './styles.module.scss';
import { NavLink } from 'react-router-dom';
import { CellShade } from '~/components/flow/CellShade';
import { FlowCellImage } from '~/components/flow/FlowCellImage';
import { FlowDisplayVariant } from '~/redux/types';
import { FlowCellText } from '~/components/flow/FlowCellText';
import classNames from 'classnames';

interface Props {
  to: string;
  title: string;
  image?: string;
  color?: string;
  text?: string;
  display?: FlowDisplayVariant;
}

const FlowCell: FC<Props> = ({ color, to, image, display = 'single', text, title }) => {
  const withText = ((!!display && display !== 'single') || !image) && !!text;

  return (
    <NavLink className={classNames(styles.cell, styles[display || 'single'])} to={to}>
      {withText && (
        <FlowCellText className={styles.text} title={title}>
          {text!}
        </FlowCellText>
      )}

      {image && (
        <FlowCellImage
          src={image}
          height={400}
          className={styles.thumb}
          style={{ backgroundColor: color }}
        />
      )}

      <CellShade color={color} className={styles.shade} size={withText ? 15 : 50} />
      {!withText && <h4 className={styles.title}>{title}</h4>}
    </NavLink>
  );
};

export { FlowCell };
