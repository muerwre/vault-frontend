import { useEffect, useRef } from 'react';

import 'photoswipe/style.css';

import { observer } from 'mobx-react-lite';
import PSWP from 'photoswipe';
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
  const pswp = useRef(new PSWP());

  useEffect(() => {
    const dataSource = items.map((file) => ({
      src: getURL(file, imagePresets[1600]),
      width: file.metadata?.width,
      height: file.metadata?.height,
    }));

    pswp.current.options = {
      ...pswp.current.options,
      dataSource,
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
    };

    pswp.current.on('closingAnimationEnd', hideModal);
    pswp.current.init();

    return () => {
      pswp.current?.off('close', hideModal);
      pswp.current?.destroy();
    };
  }, [hideModal, items, index, isTablet]);

  return null;
});

export { PhotoSwipe };
