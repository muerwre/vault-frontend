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

interface IProps {
  is_loading: boolean;
  node: INode;
}

const NodeImageBlock: FC<IProps> = ({ node, is_loading }) => {
  const [current, setCurrent] = useState(0);
  const [height, setHeight] = useState(320);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const refs = useRef<Record<number, HTMLDivElement>>({});

  const images = useMemo(
    () =>
      (node && node.files && node.files.filter(({ type }) => type === UPLOAD_TYPES.IMAGE)) || [],
    [node]
  );

  const setRef = useCallback(index => el => (refs.current[index] = el), [refs]);
  const onImageLoad = useCallback(index => () => setLoaded({ ...loaded, [index]: true }), [
    setLoaded,
    loaded,
  ]);

  useEffect(() => {
    if (!refs || !refs.current[current] || !loaded[current]) return setHeight(320);

    const el = refs.current[current];

    const element_height = el.getBoundingClientRect && el.getBoundingClientRect().height;

    setHeight(element_height);
  }, [refs, current, loaded]);

  return (
    <div className={classNames(styles.wrap, { is_loading })}>
      <div>
        <ImageSwitcher
          total={images.length}
          current={current}
          onChange={setCurrent}
          loaded={loaded}
        />

        <div className={styles.image_container} style={{ height }}>
          {(is_loading || !loaded[0] || !images.length) && <div className={styles.placeholder} />}

          {images.map((file, index) => (
            <div
              className={classNames(styles.image_wrap, {
                is_active: index === current && loaded[index],
              })}
              ref={setRef(index)}
              key={file.id}
            >
              <img
                className={styles.image}
                src={getImageSize(file.url, 'node')}
                alt=""
                key={file.id}
                onLoad={onImageLoad(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { NodeImageBlock };
