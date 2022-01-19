import React, { FC, memo } from 'react';

import classNames from 'classnames';
import range from 'ramda/es/range';

import { Group } from '~/components/containers/Group';
import cell_style from '~/components/node/NodeRelatedItem/styles.module.scss';
import { Placeholder } from '~/components/placeholders/Placeholder';

import styles from './styles.module.scss';


interface IProps {}

const NodeRelatedPlaceholder: FC<IProps> = memo(() => {
  return (
    <Group className={classNames(styles.wrap, styles.placeholder)}>
      <div className={styles.title}>
        <div className={styles.line} />
        <div className={styles.text}>
          <Placeholder />
        </div>
        <div className={styles.line} />
      </div>

      <div className={styles.grid}>
        {range(0, 6).map(el => (
          <div className={cell_style.item} key={el} />
        ))}
      </div>
    </Group>
  );
});

export { NodeRelatedPlaceholder };
