import React, { FC, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { ImageSwitcher } from '../ImageSwitcher';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';
import classNames from 'classnames';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { NODE_SETTINGS } from '~/redux/node/constants';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { throttle } from 'throttle-debounce';

interface IProps {
  is_loading: boolean;
  node: INode;
  layout: {};
  updateLayout: () => void;
}

const getX = event => (event.touches ? event.touches[0].clientX : event.clientX);

const NodeImageSlideBlock: FC<IProps> = ({ node, is_loading, updateLayout }) => {
  const [current, setCurrent] = useState(0);
  const [height, setHeight] = useState(320);
  const [max_height, setMaxHeight] = useState(960);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const refs = useRef<Record<number, HTMLDivElement>>({});
  const [heights, setHeights] = useState({});

  const [initial_offset, setInitialOffset] = useState(0);
  const [initial_x, setInitialX] = useState(0);
  const [offset, setOffset] = useState(0);
  const [is_dragging, setIsDragging] = useState(false);
  const slide = useRef<HTMLDivElement>();
  const wrap = useRef<HTMLDivElement>();

  const setHeightThrottled = useCallback(throttle(100, setHeight), [setHeight]);

  const images = useMemo(
    () =>
      (node && node.files && node.files.filter(({ type }) => type === UPLOAD_TYPES.IMAGE)) || [],
    [node]
  );

  useEffect(() => {
    setLoaded({});
    refs.current = {};
  }, [images]);

  const updateSizes = useCallback(() => {
    const values = Object.keys(refs.current).reduce((obj, key) => {
      const ref = refs.current[key];

      if (!ref || !ref.getBoundingClientRect) return 0;

      return { ...obj, [key]: ref.getBoundingClientRect().height };
    }, {});

    setHeights(values);
  }, [refs]);

  const setRef = useCallback(
    index => el => {
      refs.current[index] = el;
    },
    [refs, heights, setHeights, images]
  );

  const onImageLoad = useCallback(index => () => setLoaded({ ...loaded, [index]: true }), [
    setLoaded,
    loaded,
  ]);

  // update outside hooks
  useEffect(() => updateLayout(), [loaded, height, images]);
  useEffect(() => updateSizes(), [refs, current, loaded, images]);

  useEffect(() => {
    if (!wrap || !wrap.current) return;

    const { width } = wrap.current.getBoundingClientRect();

    if (is_loading) return setHeight((width * 9) / 16);

    const selected = Math.abs(-offset / width);

    if (!heights[Math.round(selected)]) return setHeight((width * 9) / 16);

    const prev = Math.max(heights[Math.floor(selected)] || 320, 320);
    const next = Math.max(heights[Math.ceil(selected)] || 320, 320);
    const now = prev - (prev - next) * (selected % 1);

    if (current !== Math.round(selected)) setCurrent(Math.round(selected));

    if (!is_dragging) {
      setHeight(now);
    } else {
      setHeightThrottled(now);
    }

    // update layout after all manipulations
    const timeout = setTimeout(() => updateLayout(), 500);
    return () => clearTimeout(timeout);
  }, [is_dragging, wrap, offset, heights, max_height, images, is_loading]);

  const onDrag = useCallback(
    event => {
      if (
        !is_dragging ||
        !slide.current ||
        !wrap.current ||
        (event.touches && event.clientY > event.clientX)
      )
        return;

      const { width: slide_width } = slide.current.getBoundingClientRect();
      const { width: wrap_width } = wrap.current.getBoundingClientRect();

      setOffset(
        Math.min(Math.max(initial_offset + getX(event) - initial_x, wrap_width - slide_width), 0)
      );
    },
    [is_dragging, initial_x, setOffset, initial_offset]
  );

  const normalizeOffset = useCallback(() => {
    if (!slide.current || !wrap.current) return;

    const { width: wrap_width } = wrap.current.getBoundingClientRect();
    const { width: slide_width } = slide.current.getBoundingClientRect();

    const shift = (initial_offset - offset) / wrap_width; // percent / 100
    const diff = initial_offset - (shift > 0 ? Math.ceil(shift) : Math.floor(shift)) * wrap_width;
    const new_offset =
      Math.abs(shift) > 0.25
        ? Math.min(Math.max(diff, wrap_width - slide_width), 0) // next or prev slide
        : Math.round(offset / wrap_width) * wrap_width; // back to this one

    setOffset(new_offset);
  }, [wrap, offset, initial_offset]);

  const updateMaxHeight = useCallback(() => {
    if (!wrap.current) return;
    const { width } = wrap.current.getBoundingClientRect();
    setMaxHeight(width * NODE_SETTINGS.MAX_IMAGE_ASPECT);
    normalizeOffset();
  }, [wrap, setMaxHeight, normalizeOffset]);

  const stopDragging = useCallback(() => {
    if (!is_dragging) return;

    normalizeOffset();
    setIsDragging(false);
  }, [setIsDragging, is_dragging, normalizeOffset]);

  const startDragging = useCallback(
    event => {
      setIsDragging(true);
      setInitialX(getX(event));
      setInitialOffset(offset);
    },
    [setIsDragging, setInitialX, offset, setInitialOffset]
  );

  useEffect(() => updateMaxHeight(), [images]);

  useEffect(() => {
    window.addEventListener('resize', updateSizes);
    window.addEventListener('resize', updateMaxHeight);

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag);

    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);

    return () => {
      window.removeEventListener('resize', updateSizes);
      window.removeEventListener('resize', updateMaxHeight);

      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('touchmove', onDrag);

      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [onDrag, stopDragging, updateMaxHeight, updateSizes]);

  const changeCurrent = useCallback(
    (item: number) => {
      const { width } = wrap.current.getBoundingClientRect();
      setOffset(-1 * item * width);
    },
    [wrap]
  );

  return (
    <div className={classNames(styles.wrap, { is_loading })} ref={wrap}>
      {is_loading && (
        <div className={styles.placeholder}>
          <div>
            <LoaderCircle size={96} />
          </div>
        </div>
      )}

      <ImageSwitcher
        total={images.length}
        current={current}
        onChange={changeCurrent}
        loaded={loaded}
      />

      <div
        className={styles.image_container}
        style={{
          height,
          transform: `translate(${offset}px, 0)`,
          width: `${images.length * 100}%`,
        }}
        onMouseDown={startDragging}
        onTouchStart={startDragging}
        ref={slide}
      >
        {!is_loading &&
          images.map((file, index) => (
            <div
              className={classNames(styles.image_wrap, {
                is_active: index === current && loaded[index],
              })}
              ref={setRef(index)}
              key={file.id}
            >
              <img
                className={styles.image}
                src={getURL(file, PRESETS['1400'])}
                alt=""
                key={file.id}
                onLoad={onImageLoad(index)}
                style={{ maxHeight: max_height }}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export { NodeImageSlideBlock };
