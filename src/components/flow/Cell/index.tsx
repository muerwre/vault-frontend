import React, { FC, useState, useCallback } from 'react';
import { INode } from '~/redux/types';
import { getURL } from '~/utils/dom';
import classNames from 'classnames';

import * as styles from './styles.scss';
import path from 'ramda/es/path';
import { Icon } from '~/components/input/Icon';
import { flowSetCellView } from '~/redux/flow/actions';

interface IProps {
  node: INode;
  is_text?: boolean;
  can_edit?: boolean;

  onSelect: (id: INode['id'], type: INode['type']) => void;
  onChangeCellView: typeof flowSetCellView;
}

const Cell: FC<IProps> = ({
  node: { id, title, thumbnail, type, blocks, flow },
  can_edit,
  onSelect,
  onChangeCellView,
}) => {
  const [is_loaded, setIsLoaded] = useState(false);

  const onImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);

  const onClick = useCallback(() => onSelect(id, type), [onSelect, id]);

  const text = path([0, 'text'], blocks);

  const toggleViewDescription = useCallback(() => {
    const show_description = flow && !flow.show_description;
    const display = (flow && flow.display) || 'single';
    onChangeCellView(id, { show_description, display });
  }, [id, flow, onChangeCellView]);

  const setViewSingle = useCallback(() => {
    const show_description = flow && !!flow.show_description;
    onChangeCellView(id, { show_description, display: 'single' });
  }, [id, flow, onChangeCellView]);

  const setViewHorizontal = useCallback(() => {
    const show_description = flow && !!flow.show_description;
    onChangeCellView(id, { show_description, display: 'horizontal' });
  }, [id, flow, onChangeCellView]);

  const setViewVertical = useCallback(() => {
    const show_description = flow && !!flow.show_description;
    onChangeCellView(id, { show_description, display: 'vertical' });
  }, [id, flow, onChangeCellView]);

  const setViewQuadro = useCallback(() => {
    const show_description = flow && !!flow.show_description;
    onChangeCellView(id, { show_description, display: 'quadro' });
  }, [id, flow, onChangeCellView]);

  return (
    <div
      className={classNames(styles.cell, (flow && flow.display) || 'single', { is_text: false })}
    >
      {can_edit && (
        <div className={styles.menu}>
          <div className={styles.menu_button}>
            <Icon icon="dots-vertical" />
          </div>

          <div className={styles.menu_content}>
            <Icon icon="cell-single" onClick={toggleViewDescription} />
            <div className={styles.menu_sep} />
            <Icon icon="cell-single" onClick={setViewSingle} />
            <Icon icon="cell-double-h" onClick={setViewHorizontal} />
            <Icon icon="cell-double-v" onClick={setViewVertical} />
            <Icon icon="cell-quadro" onClick={setViewQuadro} />
          </div>
        </div>
      )}

      <div className={styles.face} onClick={onClick}>
        {title && <div className={styles.title}>{title}</div>}
        {text && <div className={styles.text}>{text}</div>}
      </div>

      {thumbnail && (
        <div
          className={styles.thumbnail}
          style={{
            backgroundImage: `url("${getURL({ url: thumbnail })}")`,
            opacity: is_loaded ? 1 : 0,
          }}
        >
          <img src={getURL({ url: thumbnail })} onLoad={onImageLoad} alt="" />
        </div>
      )}
    </div>
  );
};

export { Cell };
