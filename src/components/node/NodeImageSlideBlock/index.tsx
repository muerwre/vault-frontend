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
  const slide = useRef<HTMLDivElement>();
  const wrap = useRef<HTMLDivElement>();

  const images = useMemo(
    () =>
      (node && node.files && node.files.filter(({ type }) => type === UPLOAD_TYPES.IMAGE)) || [],
    [node]
  );

  // console.log({ heights });

  const updateSizes = useCallback(() => {
    const values = Object.keys(refs.current).reduce((obj, key) => {
      const ref = refs.current[key];
      if (!ref || !ref.getBoundingClientRect) return 0;
      return { ...obj, [key]: ref.getBoundingClientRect().height };
    }, {});

    setHeights(values);
    console.log({ values });
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

  useEffect(() => {
    if (!wrap || !wrap.current) return;

    const { width } = wrap.current.getBoundingClientRect();
    const selected = Math.abs(-offset / width);
    const prev = Math.max(heights[Math.floor(selected)] || 320, 320);
    const next = Math.max(heights[Math.ceil(selected)] || 320, 320);
    const now = prev - (prev - next) * (selected % 1);

    setHeight(now);
  }, [offset, heights]);

  // useEffect(() => {
  // const timer = setTimeout(() => setIsAnimated(true), 250);
  //
  // return () => clearTimeout(timer);
  // }, []);

  const onDrag = useCallback(
    event => {
      if (!is_dragging || !slide.current || !wrap.current) return;

      const { width: slide_width } = slide.current.getBoundingClientRect();
      const { width: wrap_width } = wrap.current.getBoundingClientRect();

      console.log(wrap_width - slide_width, initial_offset + event.clientX - initial_x);

      setOffset(
        Math.min(Math.max(initial_offset + event.clientX - initial_x, wrap_width - slide_width), 0)
      );
    },
    [is_dragging, initial_x, setOffset, initial_offset]
  );

  const stopDragging = useCallback(() => {
    window.removeEventListener('mouseup', stopDragging);
    setIsDragging(false);
  }, [setIsDragging, onDrag]);

  const startDragging: MouseEventHandler<HTMLDivElement> = useCallback(
    event => {
      setIsDragging(true);
      setInitialX(event.clientX);
      setInitialOffset(offset);

      window.addEventListener('mouseup', stopDragging);
    },
    [setIsDragging, stopDragging, setInitialX, offset, setInitialOffset, onDrag]
  );

  useEffect(() => {
    window.addEventListener('mousemove', onDrag);

    return () => {
      window.removeEventListener('mousemove', onDrag);
    };
  }, [onDrag]);

  return (
    <div className={classNames(styles.wrap, { is_loading, is_animated })} ref={wrap}>
      <div
        className={styles.image_container}
        style={{
          height,
          transform: `translate(${offset}px, 0)`,
          width: `${images.length * 100}%`,
        }}
        onMouseDown={startDragging}
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
