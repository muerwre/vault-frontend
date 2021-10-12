import React, { FC } from 'react';
import styles from './styles.module.scss';
import { NavLink } from 'react-router-dom';
import { CellShade } from '~/components/flow/CellShade';
import { FlowCellImage } from '~/components/flow/FlowCellImage';
import { FlowDisplay, FlowDisplayVariant, INode } from '~/redux/types';
import { FlowCellText } from '~/components/flow/FlowCellText';
import classNames from 'classnames';
import { FlowCellMenu } from '~/components/flow/FlowCellMenu';
import { useFlowCellControls } from '~/utils/hooks/flow/useFlowCellControls';

interface Props {
  id: INode['id'];
  to: string;
  title: string;
  image?: string;
  color?: string;
  text?: string;
  flow: FlowDisplay;
  canEdit?: boolean;
  onChangeCellView: (id: INode['id'], flow: FlowDisplay) => void;
}

const FlowCell: FC<Props> = ({
  id,
  color,
  to,
  image,
  flow,
  text,
  title,
  canEdit,
  onChangeCellView,
}) => {
  const withText = ((!!flow.display && flow.display !== 'single') || !image) && !!text;
  const {
    hasDescription,
    setViewHorizontal,
    setViewVertical,
    setViewQuadro,
    setViewSingle,
    toggleViewDescription,
  } = useFlowCellControls(id, text, flow, onChangeCellView);

  return (
    <div className={classNames(styles.cell, styles[flow.display || 'single'])}>
      {canEdit && (
        <div className={styles.menu}>
          <FlowCellMenu
            hasDescription={hasDescription}
            setViewHorizontal={setViewHorizontal}
            setViewQuadro={setViewQuadro}
            setViewSingle={setViewSingle}
            setViewVertical={setViewVertical}
            toggleViewDescription={toggleViewDescription}
          />
        </div>
      )}
      <NavLink className={styles.link} to={to}>
        {withText && (
          <FlowCellText className={styles.text} heading={<h4 className={styles.title}>{title}</h4>}>
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

        {!withText && (
          <div className={styles.title_wrapper}>
            <h4 className={styles.title}>{title}</h4>
          </div>
        )}
      </NavLink>
    </div>
  );
};

export { FlowCell };
