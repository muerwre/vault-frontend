import React, { FC } from 'react';
import { Tags } from '../Tags';

interface IProps {}

const NodeTags: FC<IProps> = ({}) => (
  <Tags
    tags={[
      { title: 'Избранный', feature: 'red' },
      { title: 'Плейлист', feature: 'green' },
      { title: 'Просто' },
      { title: '+ фото', feature: 'black' },
      { title: '+ с музыкой', feature: 'black' },
    ]}
  />
);

export { NodeTags };
