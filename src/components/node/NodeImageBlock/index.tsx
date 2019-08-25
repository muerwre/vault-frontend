import React, { FC, useMemo } from 'react';
import { ImageSwitcher } from '../ImageSwitcher';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';
import classNames from 'classnames';
import { getImageSize } from '~/utils/dom';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';

interface IProps {
  is_loading: boolean;
  node: INode;
}

const NodeImageBlock: FC<IProps> = ({ node, is_loading }) => {
  const images = useMemo(() => node.files.filter(({ type }) => type === UPLOAD_TYPES.IMAGE), [
    node,
  ]);

  return (
    <div className={classNames(styles.wrap, { is_loading })}>
      {!is_loading && (
        <div>
          <ImageSwitcher total={5} current={2} />

          <div className={styles.image_container}>
            {images.map(file => (
              <img
                className={styles.image}
                src={getImageSize(file.url, 'node')}
                alt=""
                key={file.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { NodeImageBlock };
