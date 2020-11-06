import React, { FC, useMemo } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import classNames from 'classnames';
import { Filler } from '~/components/containers/Filler';
import { ERRORS } from '~/constants/errors';
import { t } from '~/utils/trans';

interface IProps {
  is_loading?: boolean;
  count?: number;
}

const NodeNoComments: FC<IProps> = ({ is_loading = false, count = 3 }) => {
  const items = useMemo(
    () => [...new Array(count)].map((_, i) => <div className={styles.card} key={i} />),
    [count]
  );

  return (
    <Group className={classNames(styles.wrap, { is_loading })}>
      {items}
      {!is_loading && <div className={styles.nothing}>{t(ERRORS.NO_COMMENTS)}</div>}
    </Group>
  );
};

export { NodeNoComments };
