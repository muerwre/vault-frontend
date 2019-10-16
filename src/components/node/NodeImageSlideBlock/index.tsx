import React, {
  FC,
  useMemo,
  useState,
  useEffect,
  RefObject,
  LegacyRef,
  useRef,
  useCallback,
  MouseEventHandler,
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
  layout: {};
  updateLayout: () => void;
}

const NodeImageSlideBlock: FC<IProps> = ({ node, is_loading, updateLayout }) => {
  const [is_animated, setIsAnimated] = useState(false);
  const [current, setCurrent] = useState(0);
  const [height, setHeight] = useState(320);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const refs = useRef<Record<number, HTMLDivElement>>({});
  const [heights, setHeights] = useState({});

  const [initial_offset, setInitialOffset] = useState(0);
  const [initial_x, setInitialX] = useState(0);
  const [offset, setOffset] = useState(0);
  const [is_dragging, setIsDragging] = useState(false);
  const slide = useRef();

  const images = useMemo(
    () =>
      (node && node.files && node.files.filter(({ type }) => type === UPLOAD_TYPES.IMAGE)) || [],
    [node]
  );

  // console.log({ heights });

  const updateSizes = useCallback(() => {
    const values = Object.keys(refs.current).map(key => {
      const ref = refs.current[key];
      if (!ref || !ref.getBoundingClientRect) return 0;
      return ref.getBoundingClientRect().height;
    });
  }, [refs]);

  const setRef = useCallback(
    index => el => {
      refs.current[index] = el;
    },
    [refs, heights, setHeights]
  );

  const onImageLoad = useCallback(index => () => setLoaded({ ...loaded, [index]: true }), [
    setLoaded,
    loaded,
  ]);

  // update outside hooks
  useEffect(() => updateLayout(), [loaded]);

  useEffect(() => {
    updateSizes();
    //
    // if (!refs || !refs.current[current] || !loaded[current]) return setHeight(320);
    //
    // const el = refs.current[current];
    //
    // const element_height = el.getBoundingClientRect && el.getBoundingClientRect().height;
    //
    // setHeight(element_height);
  }, [refs, current, loaded]);

  // useEffect(() => {
  // const timer = setTimeout(() => setIsAnimated(true), 250);
  //
  // return () => clearTimeout(timer);
  // }, []);

  const stopDragging = useCallback(() => {
    window.removeEventListener('mouseup', stopDragging);
    setIsDragging(false);
  }, [setIsDragging]);

  const startDragging: MouseEventHandler<HTMLDivElement> = useCallback(
    event => {
      window.addEventListener('mouseup', stopDragging);
      setIsDragging(true);
      setInitialX(event.clientX);
      setInitialOffset(offset);
    },
    [setIsDragging, stopDragging, setInitialX, offset, setInitialOffset]
  );

  const onDrag = useCallback(
    event => {
      if (!is_dragging) return;

      setOffset(initial_offset + event.clientX - initial_x);
    },
    [is_dragging, initial_x, setOffset, initial_offset]
  );

  return (
    <div className={classNames(styles.wrap, { is_loading, is_animated })}>
      <div
        className={styles.image_container}
        style={{
          height,
          transform: `translate(${offset}px, 0)`,
          width: `${images.length * 100}%`,
        }}
        onMouseDown={startDragging}
        onMouseMove={onDrag}
        ref={slide}
      >
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
              src={getImageSize(file, 'node')}
              alt=""
              key={file.id}
              onLoad={onImageLoad(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export { NodeImageSlideBlock };
