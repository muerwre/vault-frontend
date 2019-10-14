import React, { FC, useState, useCallback } from 'react';
import { INode } from '~/redux/types';
import { URLS } from '~/constants/urls';
import { getImageSize, getURL } from '~/utils/dom';
import classNames = require('classnames');

import * as styles from './styles.scss';

interface IProps {
  node: INode;
  // height?: number;
  // width?: number;
  // title?: string;
  // is_hero?: boolean;
  // is_stamp?: boolean;
  onSelect: (id: INode['id'], type: INode['type']) => void;
  is_text?: boolean;
}

const Cell: FC<IProps> = ({ node: { id, title, brief, type }, onSelect, is_text = false }) => {
  const [is_loaded, setIsLoaded] = useState(false);

  const onImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);

  const onClick = useCallback(() => onSelect(id, type), [onSelect, id]);

  return (
    <div
      className={classNames(styles.cell, 'vert-1', 'hor-1', { is_text: false })}
      onClick={onClick}
    >
      <div className={styles.face}>{title && <div className={styles.title}>{title}</div>}</div>

      {brief && brief.thumbnail && (
        <div
          className={styles.thumbnail}
          style={{
            backgroundImage: `url("${getURL({ url: brief.thumbnail })}")`,
            opacity: is_loaded ? 1 : 0,
          }}
        >
          <img src={getURL({ url: brief.thumbnail })} onLoad={onImageLoad} alt="" />
        </div>
      )}
    </div>
  );
};

export { Cell };
