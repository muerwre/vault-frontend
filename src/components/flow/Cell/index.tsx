import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { INode } from '~/redux/types';
import { formatCellText, getURL } from '~/utils/dom';
import classNames from 'classnames';

import styles from './styles.module.scss';
import markdown from '~/styles/common/markdown.module.scss';
import { Icon } from '~/components/input/Icon';
import { PRESETS } from '~/constants/urls';
import { NODE_TYPES } from '~/redux/node/constants';
import { Link } from 'react-router-dom';
import { CellShade } from '~/components/flow/CellShade';

const THUMBNAIL_SIZES = {
  horizontal: PRESETS.small_hero,
  default: PRESETS.cover,
};
interface IProps {
  node: INode;
  is_text?: boolean;
  can_edit?: boolean;

  onSelect: (id: INode['id']) => void;
  onChangeCellView: (id: INode['id'], flow: INode['flow']) => void;
}

const Cell: FC<IProps> = ({
  node: { id, title, thumbnail, type, flow, description },
  can_edit,
  onChangeCellView,
}) => {
  const ref = useRef(null);
  const [is_loaded, setIsLoaded] = useState(false);
  const [is_visible, setIsVisible] = useState(true);

  const onImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);

  const has_description = description && description.length > 32;
  const text =
    (type === NODE_TYPES.TEXT && description) ||
    (flow && flow.show_description && has_description && description) ||
    null;

  const toggleViewDescription = useCallback(() => {
    const show_description = !(flow && flow.show_description);
    const display = (flow && flow.display) || 'single';
    onChangeCellView(id, { show_description, display });
  }, [id, flow, onChangeCellView]);

  const setViewSingle = useCallback(() => {
    const show_description = (flow && flow.show_description) || false;
    onChangeCellView(id, { show_description, display: 'single' });
  }, [id, flow, onChangeCellView]);

  const setViewHorizontal = useCallback(() => {
    const show_description = (flow && flow.show_description) || false;
    onChangeCellView(id, { show_description, display: 'horizontal' });
  }, [id, flow, onChangeCellView]);

  const setViewVertical = useCallback(() => {
    const show_description = (flow && !!flow.show_description) || false;
    onChangeCellView(id, { show_description, display: 'vertical' });
  }, [id, flow, onChangeCellView]);

  const setViewQuadro = useCallback(() => {
    const show_description = (flow && !!flow.show_description) || false;
    onChangeCellView(id, { show_description, display: 'quadro' });
  }, [id, flow, onChangeCellView]);

  const thumb = useMemo(() => {
    const preset =
      (flow && flow.display && THUMBNAIL_SIZES[flow.display]) || THUMBNAIL_SIZES.default;
    return getURL({ url: thumbnail }, preset);
  }, [thumbnail, flow]);

  const titleSize = useMemo(() => {
    if (title.length > 100) {
      return styles.small;
    } else if (title.length > 64) {
      return styles.medium;
    } else {
      return;
    }
  }, [title]);

  const cellText = useMemo(() => formatCellText(text || ''), [text]);

  return (
    <div className={classNames(styles.cell, styles[(flow && flow.display) || 'single'])} ref={ref}>
      {is_visible && (
        <>
          {can_edit && (
            <div className={styles.menu}>
              <div className={styles.menu_button} />

              <div className={styles.menu_content}>
                {has_description && (
                  <>
                    <Icon icon="text" onClick={toggleViewDescription} />
                    <div className={styles.menu_sep} />
                  </>
                )}
                <Icon icon="cell-single" onClick={setViewSingle} />
                <Icon icon="cell-double-h" onClick={setViewHorizontal} />
                <Icon icon="cell-double-v" onClick={setViewVertical} />
                <Icon icon="cell-quadro" onClick={setViewQuadro} />
              </div>
            </div>
          )}

          <Link className={classNames(styles.face)} to={`/post${id}`}>
            <CellShade color={flow.dominant_color} />

            <div className={styles.face_content}>
              {!text && <div className={classNames(styles.title, titleSize)}>{title || '...'}</div>}

              {!!text && !!thumbnail && (
                <div className={styles.text}>
                  {title && <div className={styles.text_title}>{title}</div>}

                  <div
                    dangerouslySetInnerHTML={{ __html: cellText }}
                    className={markdown.wrapper}
                  />
                </div>
              )}

              {!!text && !thumbnail && (
                <div className={styles.text_only}>
                  {title && <div className={styles.text_title}>{title}</div>}

                  <div
                    dangerouslySetInnerHTML={{ __html: cellText }}
                    className={markdown.wrapper}
                  />
                </div>
              )}
            </div>
          </Link>

          {thumbnail && (
            <div
              className={styles.thumbnail}
              style={{
                backgroundImage: `url("${thumb}")`,
                opacity: is_loaded ? 1 : 0,
              }}
            >
              <img src={thumb} onLoad={onImageLoad} alt="" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { Cell };
