import React, { FC } from 'react';
import * as styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import classNames from 'classnames';
import { Filler } from '~/components/containers/Filler';
import { ERRORS } from '~/constants/errors';
import { t } from '~/utils/trans';

interface IProps {
  is_loading: boolean;
}

const NodeNoComments: FC<IProps> = ({ is_loading = false }) => (
  <>
    <Group className={classNames(styles.wrap, { is_loading })}>
      <div className={styles.card} />
      <div className={styles.card}>{!is_loading && t(ERRORS.NO_COMMENTS)}</div>
      <div className={styles.card} />
    </Group>

    <Filler />
  </>
);

export { NodeNoComments };
