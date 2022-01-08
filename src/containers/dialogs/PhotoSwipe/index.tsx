import React, { useEffect, useRef, VFC } from 'react';

import PhotoSwipeJs from 'photoswipe/dist/photoswipe.js';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.js';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { useBlockBackButton } from '~/hooks/navigation/useBlockBackButton';
import { useModal } from '~/hooks/modal/useModal';
import { observer } from 'mobx-react';
import { IFile } from '~/redux/types';
import { DialogComponentProps } from '~/types/modal';

export interface PhotoSwipeProps extends DialogComponentProps {
  items: IFile[];
  index: number;
}

const PhotoSwipe: VFC<PhotoSwipeProps> = observer(({ index, items }) => {
  let ref = useRef<HTMLDivElement>(null);
  const { hideModal } = useModal();

  useEffect(() => {
    new Promise(async resolve => {
      const images = await Promise.all(
        items.map(
          image =>
            new Promise(resolveImage => {
              const img = new Image();

              img.onload = () => {
                resolveImage({
                  src: getURL(image, window.innerWidth < 768 ? PRESETS[900] : PRESETS[1600]),
                  h: img.naturalHeight,
                  w: img.naturalWidth,
                });
              };

              img.onerror = () => {
                resolveImage({});
              };

              img.src = getURL(image, PRESETS[1600]);
            })
        )
      );

      resolve(images);
    }).then(images => {
      const ps = new PhotoSwipeJs(ref.current, PhotoSwipeUI_Default, images, {
        index: index || 0,
        closeOnScroll: false,
        history: false,
      });

      ps.init();
      ps.listen('destroy', hideModal);
      ps.listen('close', hideModal);
    });
  }, [hideModal, items, index]);

  useBlockBackButton(hideModal);

  return (
    <div className="pswp" tabIndex={-1} role="dialog" aria-hidden="true" ref={ref}>
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
            <button className="pswp__button pswp__button--close" title="Close (Esc)" />

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

          <button className="pswp__button pswp__button--arrow--right" title="Next (arrow right)" />

          <div className="pswp__caption">
            <div className="pswp__caption__center" />
          </div>
        </div>
      </div>
    </div>
  );
});

export { PhotoSwipe };
