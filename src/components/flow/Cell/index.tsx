import React, { FC, useState, useCallback } from 'react';
import { INode } from '~/redux/types';
import { getURL } from '~/utils/dom';
import classNames from 'classnames';

import * as styles from './styles.scss';
import path from 'ramda/es/path';

interface IProps {
  node: INode;
  onSelect: (id: INode['id'], type: INode['type']) => void;
  is_text?: boolean;
}

const Cell: FC<IProps> = ({ node: { id, title, thumbnail, type, blocks }, onSelect }) => {
  const [is_loaded, setIsLoaded] = useState(false);

  const onImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);

  const onClick = useCallback(() => onSelect(id, type), [onSelect, id]);

  const text = path([0, 'text'], blocks);

  return (
    <div
      className={classNames(styles.cell, 'vert-1', 'hor-1', { is_text: false })}
      onClick={onClick}
    >
      <div className={styles.face}>
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
