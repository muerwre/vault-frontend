import React, { FC, useRef, useEffect, useMemo, useCallback } from 'react';
import { connect } from 'react-redux';

import PhotoSwipeJs from 'photoswipe/dist/photoswipe.js';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.js';
import 'photoswipe/dist/photoswipe.css';
import 'photoswipe/dist/default-skin/default-skin.css';
import { IState } from '~/redux/store';
import { selectModal } from '~/redux/modal/selectors';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import styles from './styles.scss';
import classNames from 'classnames';

const mapStateToProps = (state: IState) => ({
  photoswipe: selectModal(state).photoswipe,
});

const mapDispatchToProps = {
  modalSetShown: MODAL_ACTIONS.modalSetShown,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const PhotoSwipeUnconnected: FC<Props> = ({ photoswipe, modalSetShown }) => {
  let ref = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => modalSetShown(false), [modalSetShown]);

  useEffect(() => {
    new Promise(async resolve => {
      const images = await Promise.all(
        photoswipe.images.map(
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
        index: photoswipe.index || 0,
        closeOnScroll: false,
        history: false,
      });

      ps.init();
      ps.listen('destroy', closeModal);
      ps.listen('close', closeModal);
    });
  }, [photoswipe.images, photoswipe.index]);

  return (
    <div className="pswp" tabIndex={-1} role="dialog" aria-hidden="true" ref={ref}>
      <div className={classNames('pswp__bg', styles.bg)} />
      <div className="pswp__scroll-wrap">
        <div className="pswp__container">
          <div className="pswp__item" />
          <div className="pswp__item" />
          <div className="pswp__item" />
        </div>

        <div className="pswp__ui pswp__ui--hidden">
          <div className={classNames('pswp__top-bar', styles.bar)}>
            <div className="pswp__counter" />
            <button className="pswp__button pswp__button--close" title="Close (Esc)" />
            <button className="pswp__button pswp__button--fs" title="Toggle fullscreen" />
            <button className="pswp__button pswp__button--zoom" title="Zoom in/out" />
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
};

const PhotoSwipe = connect(mapStateToProps, mapDispatchToProps)(PhotoSwipeUnconnected);

export { PhotoSwipe };
