import { FC, useCallback, useMemo } from 'react';

import classNames from 'classnames';

import { Anchor } from '~/components/common/Anchor';
import { MenuDots } from '~/components/menu/MenuDots';
import { NODE_TYPES } from '~/constants/node';
import { useClickOutsideFocus } from '~/hooks/dom/useClickOutsideFocus';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useFlowCellControls } from '~/hooks/flow/useFlowCellControls';
import { FlowDisplay, IFile, INode } from '~/types';

import { isFullyVisible } from '../../../../../utils/dom';

import { CellShade } from './components/CellShade';
import { FlowCellImage } from './components/FlowCellImage';
import { FlowCellMenu } from './components/FlowCellMenu';
import { FlowCellPost } from './components/FlowCellPost';
import { FlowCellText } from './components/FlowCellText';
import styles from './styles.module.scss';

interface Props {
  id: INode['id'];
  to: string;
  title: string;
  image?: string;
  color?: string;

  text?: string;
  /** Text and song posts get a preview of their own, like their lab card. */
  type?: string;
  /** A song post's tracks, listed in its preview. */
  songs?: IFile[];
  flow: FlowDisplay;
  canEdit?: boolean;
  onChange: (id: INode['id'], flow: FlowDisplay) => void;
  /** Shown in the menu when the cell has its own look to drop. */
  onReset?: () => void;
}

/** Post types shown by `FlowCellPost`. */
const POST_TYPES: string[] = [NODE_TYPES.TEXT, NODE_TYPES.AUDIO];

const FlowCell: FC<Props> = ({
  id,
  color,
  to,
  image,
  flow,
  text,
  type,
  songs,
  title,
  canEdit = false,
  onChange,
  onReset,
}) => {
  const { isTablet } = useWindowSize();

  // a text or song post always has its own preview; the menu's text switch
  // only decides whether the text shows under the title
  const withPost = !!type && POST_TYPES.includes(type);

  const withText =
    !withPost &&
    ((!!flow.display && flow.display !== 'single') || !image) &&
    flow.show_description &&
    !!text;

  const {
    isActive: isMenuActive,
    activate,
    ref,
    deactivate,
  } = useClickOutsideFocus();

  const onChangeWithScroll = useCallback<typeof onChange>(
    (...args) => {
      onChange(...args);

      setTimeout(() => {
        if (!isFullyVisible(ref.current)) {
          ref.current?.scrollIntoView({
            behavior: 'auto',
            block: 'center',
          });
        }
      }, 0);
    },
    [onChange, ref],
  );

  const {
    hasDescription,
    setViewHorizontal,
    setViewVertical,
    setViewQuadro,
    setViewSingle,
    toggleViewDescription,
  } = useFlowCellControls(id, text, flow, onChangeWithScroll);

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
            onReset={
              onReset
                ? () => {
                    deactivate();
                    onReset();
                  }
                : undefined
            }
          />
        </div>
      )}

      <Anchor className={styles.link} href={to}>
        {withPost && (
          <FlowCellPost
            title={title}
            text={flow.show_description ? text : undefined}
            songs={songs}
            image={image}
            color={color}
          />
        )}

        {withText && (
          <FlowCellText
            className={styles.text}
            heading={<h4 className={styles.title}>{title}</h4>}
            color={color}
          >
            {text}
          </FlowCellText>
        )}

        {image && !withPost && (
          <FlowCellImage
            src={image}
            className={styles.thumb}
            style={{ backgroundColor: color }}
          />
        )}

        {!!title && !withText && !withPost && (
          <CellShade
            color={color}
            className={styles.shade}
            size={shadeSize}
            angle={shadeAngle}
          />
        )}

        {!withText && !withPost && (
          <div className={styles.title_wrapper}>
            <h4 className={styles.title}>{title}</h4>
          </div>
        )}
      </Anchor>
    </div>
  );
};

export { FlowCell };
