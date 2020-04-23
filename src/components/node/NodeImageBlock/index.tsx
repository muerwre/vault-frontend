import React, { FC, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { ImageSwitcher } from '../ImageSwitcher';
import * as styles from './styles.scss';
import { INode } from '~/redux/types';
import classNames from 'classnames';
import { getURL } from '~/utils/dom';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { PRESETS } from '~/constants/urls';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import { LoaderCircle } from '~/components/input/LoaderCircle';

interface IProps {
  is_loading: boolean;
  node: INode;
  layout: {};
  updateLayout: () => void;
  modalShowPhotoswipe: typeof MODAL_ACTIONS.modalShowPhotoswipe;
}

const NodeImageBlock: FC<IProps> = ({ node, is_loading, updateLayout, modalShowPhotoswipe }) => {
  const [is_animated, setIsAnimated] = useState(false);
  const [current, setCurrent] = useState(0);
  const [height, setHeight] = useState(window.innerHeight - 140);
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

  useEffect(() => updateLayout(), [loaded]);

  useEffect(() => {
    if (!refs || !refs.current[current] || !loaded[current])
      return setHeight(window.innerHeight - 140);

    const el = refs.current[current];
    const element_height = el.getBoundingClientRect && el.getBoundingClientRect().height;

    setHeight(element_height);
  }, [refs, current, loaded]);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 250);
    return () => clearTimeout(timer);
  }, []);

  const onOpenPhotoSwipe = useCallback(() => modalShowPhotoswipe(images, current), [
    modalShowPhotoswipe,
    images,
    current,
  ]);

  return (
    <div className={classNames(styles.wrap, { is_loading, is_animated })}>
      <div className={styles.image_container} style={{ height }} onClick={onOpenPhotoSwipe}>
        {(is_loading || !loaded[0] || !images.length) && (
          <div className={styles.placeholder}>
            <LoaderCircle size={72} />
          </div>
        )}

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
              src={getURL(file, PRESETS['1600'])}
              alt=""
              key={file.id}
              onLoad={onImageLoad(index)}
            />
          </div>
        ))}
      </div>

      <ImageSwitcher
        total={images.length}
        current={current}
        onChange={setCurrent}
        loaded={loaded}
      />
    </div>
  );
};

export { NodeImageBlock };
