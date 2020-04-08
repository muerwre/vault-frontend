import React, { FC, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { INode } from '~/redux/types';
import { getURL, formatCellText } from '~/utils/dom';
import classNames from 'classnames';

import * as styles from './styles.scss';
import { Icon } from '~/components/input/Icon';
import { flowSetCellView } from '~/redux/flow/actions';
import { PRESETS } from '~/constants/urls';
import { debounce } from 'throttle-debounce';
import { NODE_TYPES } from '~/redux/node/constants';
import { Group } from '~/components/containers/Group';

const THUMBNAIL_SIZES = {
  horizontal: PRESETS.small_hero,
  default: PRESETS.cover,
};
interface IProps {
  node: INode;
  is_text?: boolean;
  can_edit?: boolean;

  onSelect: (id: INode['id'], type: INode['type']) => void;
  onChangeCellView: typeof flowSetCellView;
}

const Cell: FC<IProps> = ({
  node: { id, title, thumbnail, type, flow, description },
  can_edit,
  onSelect,
  onChangeCellView,
}) => {
  const ref = useRef(null);
  const [is_loaded, setIsLoaded] = useState(false);
  const [is_visible, setIsVisible] = useState(false);

  const checkIfVisible = useCallback(() => {
    if (!ref.current) return;

    const { top, height } = ref.current.getBoundingClientRect();

    // const visibility = top + height > -window.innerHeight && top < window.innerHeight * 2;
    const visibility = top + height > -600 && top < window.innerHeight + 600;
    if (visibility !== is_visible) setIsVisible(visibility);
  }, [ref, is_visible, setIsVisible]);

  const checkIfVisibleDebounced = useCallback(debounce(Math.random() * 100 + 100, checkIfVisible), [
    checkIfVisible,
  ]);

  useEffect(() => {
    checkIfVisibleDebounced();
  }, []);

  useEffect(() => {
    // recalc visibility of other elements
    window.dispatchEvent(new CustomEvent('scroll'));
  }, [flow]);

  useEffect(() => {
    window.addEventListener('scroll', checkIfVisibleDebounced);

    return () => window.removeEventListener('scroll', checkIfVisibleDebounced);
  }, [checkIfVisibleDebounced]);

  const onImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);

  const onClick = useCallback(() => onSelect(id, type), [onSelect, id, type]);
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
    const show_description = (flow && !!flow.show_description) || false;
    onChangeCellView(id, { show_description, display: 'single' });
  }, [id, flow, onChangeCellView]);

  const setViewHorizontal = useCallback(() => {
    const show_description = (flow && !!flow.show_description) || false;
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

          <div className={classNames(styles.face)} onClick={onClick}>
            <div className={styles.face_content}>
              {title && !text && <div className={styles.title}>{title}</div>}

              {!!text && !!thumbnail && (
                <div className={styles.text}>
                  {title && <div className={styles.text_title}>{title}</div>}

                  <Group dangerouslySetInnerHTML={{ __html: formatCellText(text) }} />
                </div>
              )}

              {!!text && !thumbnail && (
                <div className={styles.text_only}>
                  {title && <div className={styles.text_title}>{title}</div>}

                  <Group dangerouslySetInnerHTML={{ __html: formatCellText(text) }} />
                </div>
              )}
            </div>
          </div>

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
