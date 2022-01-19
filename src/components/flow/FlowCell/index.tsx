import React, { FC } from 'react';
import styles from './styles.module.scss';
import { CellShade } from '~/components/flow/CellShade';
import { FlowDisplay, INode } from '~/types';
import { FlowCellText } from '~/components/flow/FlowCellText';
import classNames from 'classnames';
import { FlowCellMenu } from '~/components/flow/FlowCellMenu';
import { useFlowCellControls } from '~/hooks/flow/useFlowCellControls';
import { useClickOutsideFocus } from '~/hooks/dom/useClickOutsideFocus';
import { MenuDots } from '~/components/common/MenuDots';
import { FlowCellImage } from '~/components/flow/FlowCellImage';
import { Anchor } from '~/components/common/Anchor';

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
  canEdit = false,
  onChangeCellView,
}) => {
  const withText =
    ((!!flow.display && flow.display !== 'single') || !image) && flow.show_description && !!text;
  const {
    hasDescription,
    setViewHorizontal,
    setViewVertical,
    setViewQuadro,
    setViewSingle,
    toggleViewDescription,
  } = useFlowCellControls(id, text, flow, onChangeCellView);
  const { isActive: isMenuActive, activate, ref, deactivate } = useClickOutsideFocus();

  return (
    <div className={classNames(styles.cell, styles[flow.display || 'single'])} ref={ref as any}>
      {canEdit && !isMenuActive && (
        <div className={styles.menu}>
          <MenuDots onClick={activate} />
        </div>
      )}

      {canEdit && isMenuActive && (
        <div className={styles.display_modal}>
          <FlowCellMenu
            onClose={deactivate}
            currentView={flow.display}
            descriptionEnabled={flow.show_description}
            hasDescription={hasDescription}
            setViewHorizontal={setViewHorizontal}
            setViewQuadro={setViewQuadro}
            setViewSingle={setViewSingle}
            setViewVertical={setViewVertical}
            toggleViewDescription={toggleViewDescription}
          />
        </div>
      )}

      <Anchor className={styles.link} href={to}>
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
      </Anchor>
    </div>
  );
};

export { FlowCell };
