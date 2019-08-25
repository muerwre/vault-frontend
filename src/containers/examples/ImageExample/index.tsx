import React, { FC } from 'react';
import range from 'ramda/es/range';
import { Card } from '~/components/containers/Card';
import * as styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { Comment } from '~/components/node/Comment';
import { NodePanel } from '~/components/node/NodePanel';
import { NodeRelated } from '~/components/node/NodeRelated';
import { Tags } from '~/components/node/Tags';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { ImageSwitcher } from '~/components/node/ImageSwitcher';

interface IProps {}

const ImageExample: FC<IProps> = () => <Card className={styles.node} seamless></Card>;

export { ImageExample };

/*
<Padder className={styles.buttons}>
  <Group>
    <MenuButton title="На главной" description="плывет по течению" icon="star" />

    <MenuButton title="Видно всем" icon="star" />

    <MenuButton title="Редактировать" icon="star" />
  </Group>
</Padder>
 */
