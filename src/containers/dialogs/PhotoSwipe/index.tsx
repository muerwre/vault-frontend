import { useEffect, useRef, VFC } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.js';
import PhotoSwipeJs from 'photoswipe/dist/photoswipe.js';

import { imagePresets } from '~/constants/urls';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useModal } from '~/hooks/modal/useModal';
import { IFile } from '~/types';
import { DialogComponentProps } from '~/types/modal';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

export interface PhotoSwipeProps extends DialogComponentProps {
  items: IFile[];
  index: number;
}

const PhotoSwipe: VFC<PhotoSwipeProps> = observer(({ index, items }) => {
  let ref = useRef<HTMLDivElement>(null);
  const { hideModal } = useModal();
  const { isTablet } = useWindowSize();

  useEffect(() => {
    new Promise(async (resolve) => {
      const images = await Promise.all(
        items.map(
          (file) =>
            new Promise((resolve) => {
              const src = getURL(
                file,
                isTablet ? imagePresets[900] : imagePresets[1600],
              );

              if (file.metadata?.width && file.metadata.height) {
                resolve({
                  src,
                  w: file.metadata.width,
                  h: file.metadata.height,
                });

                return;
              }

              const img = new Image();

              img.onload = () => {
                resolve({
                  src,
                  h: img.naturalHeight,
                  w: img.naturalWidth,
                });
              };

              img.onerror = () => {
                resolve({});
              };

              img.src = getURL(file, imagePresets[1600]);
            }),
        ),
      );

      resolve(images);
    }).then((images) => {
      const ps = new PhotoSwipeJs(ref.current, PhotoSwipeUI_Default, images, {
        index: index || 0,
        closeOnScroll: false,
        history: false,
      });

      ps.init();
      ps.listen('destroy', hideModal);
      ps.listen('close', hideModal);
    });
  }, [hideModal, items, index, isTablet]);

  return (
    <div
      className="pswp"
      tabIndex={-1}
      role="dialog"
      aria-hidden="true"
      ref={ref}
    >
      <div className={classNames('pswp__bg', styles.bg)} />
      <div className={classNames('pswp__scroll-wrap', styles.wrap)}>
        <div className="pswp__container">
          <div className="pswp__item" />
          <div className="pswp__item" />
          <div className="pswp__item" />
        </div>

        <div className="pswp__ui pswp__ui--hidden">
          <div className={classNames('pswp__top-bar', styles.bar)}>
            <div className="pswp__counter" />
            <button
              className="pswp__button pswp__button--close"
              title="Close (Esc)"
            />

            <div className="pswp__preloader">
              <div className="pswp__preloader__icn">
                <div className="pswp__preloader__cut">
                  <div className="pswp__preloader__donut" />
                </div>
              </div>
            </div>
          </div>

          <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
            <div className="pswp__share-tooltip" />
          </div>

          <button
            className="pswp__button pswp__button--arrow--left"
            title="Previous (arrow left)"
          />

          <button
            className="pswp__button pswp__button--arrow--right"
            title="Next (arrow right)"
          />

          <div className="pswp__caption">
            <div className="pswp__caption__center" />
          </div>
        </div>
      </div>
    </div>
  );
});

export { PhotoSwipe };
