import React, {
  FC,
  useMemo,
  useState,
  useEffect,
  RefObject,
  LegacyRef,
  useRef,
  useCallback,
} from 'react';
import { ImageSwitcher } from '../ImageSwitcher';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';
import classNames from 'classnames';
import { getImageSize } from '~/utils/dom';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { readFileSync } from 'fs';

interface IProps {
  is_loading: boolean;
  node: INode;
}

const NodeImageBlock: FC<IProps> = ({ node, is_loading }) => {
  const [current, setCurrent] = useState(0);
  const [height, setHeight] = useState(0);
  const refs = useRef<HTMLDivElement[]>([]);
  // const [refs, setRefs] = useState<Record<number, HTMLDivElement | RefObject<any>>>({});

  const images = useMemo(
    () =>
      (node && node.files && node.files.filter(({ type }) => type === UPLOAD_TYPES.IMAGE)) || [],
    [node]
  );

  const setRef = useCallback(
    index => el => {
      refs.current[index] = el;
    },
    [refs]
  );

  useEffect(() => {
    console.log({ refs });

    if (!refs || !refs.current[current]) return;

    const el = refs.current[current];

    const element_height = el.getBoundingClientRect && el.getBoundingClientRect().height;

    setHeight(element_height);
  }, [refs, current]);

  return (
    <div className={classNames(styles.wrap, { is_loading })}>
      {!is_loading && (
        <div>
          <ImageSwitcher total={images.length} current={current} onChange={setCurrent} />

          <div className={styles.image_container} style={{ height }}>
            {images.map((file, index) => (
              <div
                className={classNames(styles.image_wrap, { is_active: index === current })}
                ref={setRef(index)}
                key={file.id}
              >
                <img
                  className={styles.image}
                  src={getImageSize(file.url, 'node')}
                  alt=""
                  key={file.id}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { NodeImageBlock };
