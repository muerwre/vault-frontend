import { useEffect } from 'react';

import 'photoswipe/style.css';

import { observer } from 'mobx-react-lite';
import { SlideData } from 'photoswipe/dist/types/slide/slide';
import { renderToStaticMarkup } from 'react-dom/server';

import { Icon } from '~/components/common/Icon';
import { imagePresets } from '~/constants/urls';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useModal } from '~/hooks/modal/useModal';
import { IFile } from '~/types';
import { DialogComponentProps } from '~/types/modal';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';
export interface Props extends DialogComponentProps {
  items: IFile[];
  index: number;
}

const arrowNextSVG = renderToStaticMarkup(<Icon icon="right" size={40} />);
const arrowPrevSVG = renderToStaticMarkup(<Icon icon="left" size={40} />);
const closeSVG = renderToStaticMarkup(<Icon icon="close" size={32} />);

const padding = { top: 10, left: 10, right: 10, bottom: 10 } as const;

const PhotoSwipe = observer(({ index, items }: Props) => {
  const { hideModal } = useModal();
  const { isTablet } = useWindowSize();

  useEffect(() => {
    Promise.all(
      items.map(
        (file): Promise<SlideData> =>
          new Promise((resolve) => {
            const src = getURL(
              file,
              isTablet ? imagePresets[900] : imagePresets[1600],
            );

            if (file.metadata?.width && file.metadata.height) {
              resolve({
                src,
                width: file.metadata.width,
                height: file.metadata.height,
              });

              return;
            }

            const img = new Image();

            img.onload = () => {
              resolve({
                src,
                height: img.naturalHeight,
                width: img.naturalWidth,
              });
            };

            img.onerror = () => {
              resolve({});
            };

            img.src = getURL(file, imagePresets[1600]);
          }),
      ),
    ).then(async (images: SlideData[]) => {
      const PSWP = await import('photoswipe').then((it) => it.default);

      const ps = new PSWP({
        dataSource: images,
        index: index || 0,
        closeOnVerticalDrag: true,
        padding,
        mainClass: styles.wrap,
        zoom: false,
        counter: false,
        bgOpacity: 0.1,
        arrowNextSVG,
        arrowPrevSVG,
        closeSVG,
      });

      ps.on('destroy', hideModal);
      ps.on('close', hideModal);

      ps.init();
    });
  }, [hideModal, items, index, isTablet]);

  return null;
});

export { PhotoSwipe };
