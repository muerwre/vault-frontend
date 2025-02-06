import { FC, useMemo } from 'react';

import classNames from 'classnames';

import { Anchor } from '~/components/common/Anchor';
import { MenuDots } from '~/components/menu/MenuDots';
import { useClickOutsideFocus } from '~/hooks/dom/useClickOutsideFocus';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useFlowCellControls } from '~/hooks/flow/useFlowCellControls';
import { FlowDisplay, INode } from '~/types';

import { CellShade } from './components/CellShade';
import { FlowCellImage } from './components/FlowCellImage';
import { FlowCellMenu } from './components/FlowCellMenu';
import { FlowCellText } from './components/FlowCellText';
import styles from './styles.module.scss';

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
  const { isTablet } = useWindowSize();

  const withText =
    ((!!flow.display && flow.display !== 'single') || !image) &&
    flow.show_description &&
    !!text;
  const {
    hasDescription,
    setViewHorizontal,
    setViewVertical,
    setViewQuadro,
    setViewSingle,
    toggleViewDescription,
  } = useFlowCellControls(id, text, flow, onChangeCellView);
  const {
    isActive: isMenuActive,
    activate,
    ref,
    deactivate,
  } = useClickOutsideFocus();

  const shadeSize = useMemo(() => {
    const min = isTablet ? 10 : 15;
    const max = isTablet ? 20 : 40;

    return withText ? min : max;
  }, [withText, isTablet]);

  const shadeAngle = useMemo(() => {
    if (flow.display === 'vertical') {
      return 9;
    }

    if (flow.display === 'horizontal') {
      return 15;
    }

    return 7;
  }, [flow.display]);

  return (
    <div
      className={classNames(styles.cell, styles[flow.display || 'single'])}
      ref={ref as any}
    >
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
          <FlowCellText
            className={styles.text}
            heading={<h4 className={styles.title}>{title}</h4>}
            color={color}
          >
            {text}
          </FlowCellText>
        )}

        {image && (
          <FlowCellImage
            src={image}
            className={styles.thumb}
            style={{ backgroundColor: color }}
          />
        )}

        {!!title && (
          <CellShade
            color={color}
            className={styles.shade}
            size={shadeSize}
            angle={shadeAngle}
          />
        )}

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
