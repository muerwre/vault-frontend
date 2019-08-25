import React, { FC, useState, useCallback } from 'react';
import { INode } from '~/redux/types';
import * as styles from './styles.scss';
import { getImageSize } from '~/utils/dom';
import classNames = require('classnames');

interface IProps {
  node: INode;
  // height?: number;
  // width?: number;
  // title?: string;
  // is_hero?: boolean;
  // is_stamp?: boolean;
  is_text?: boolean;
}

const Cell: FC<IProps> = ({ node: { title, brief }, is_text = false }) => {
  const [is_loaded, setIsLoaded] = useState(false);

  const onImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);

  return (
    <div className={classNames(styles.cell, 'vert-1', 'hor-1', { is_text: false })}>
      <div className={styles.face}>{title && <div className={styles.title}>{title}</div>}</div>

      {brief && brief.thumbnail && (
        <div
          className={styles.thumbnail}
          style={{
            backgroundImage: `url("${getImageSize(brief.thumbnail, 'medium')}")`,
            opacity: is_loaded ? 1 : 0,
          }}
        >
          <img src={getImageSize(brief.thumbnail, 'medium')} onLoad={onImageLoad} alt="" />
        </div>
      )}
    </div>
  );
};

export { Cell };

/*
  {is_text && (
    <div className={styles.text}>
      <div className={styles.text_title}>{node.title}</div>
      {TEXTS.LOREM_IPSUM}
    </div>
  )}
*/
