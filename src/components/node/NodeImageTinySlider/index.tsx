import React, { FC } from 'react';
import { INodeComponentProps } from '~/redux/node/constants';
import { FullWidth } from '~/components/containers/FullWidth';
import { useNodeImages } from '~/utils/node';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import TinySlider from 'tiny-slider-react';
import styles from './styles.module.scss';

const settings = {
  nav: false,
  buttons: false,
  mouseDrag: true,
  gutter: 10,
  center: true,
  lazyload: true,
  items: 1,
  edgePadding: 150,
  loop: true,
  arrowKeys: false,
  prevButton: false,
  nextButton: false,
  swipeAngle: 45,
};

const NodeImageTinySlider: FC<INodeComponentProps> = ({ node }) => {
  const images = useNodeImages(node);

  return (
    <FullWidth>
      <div className={styles.slider}>
        <TinySlider settings={settings}>
          {images.map(image => (
            <img src={getURL(image, PRESETS['1600'])} key={image.url} />
          ))}
        </TinySlider>
      </div>
    </FullWidth>
  );
};

export { NodeImageTinySlider };
