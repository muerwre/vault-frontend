import React, { FC, useMemo } from 'react';

import classNames from 'classnames';

import { Group } from '~/components/containers/Group';
import { ERRORS } from '~/constants/errors';
import { t } from '~/utils/trans';

import styles from './styles.module.scss';

interface IProps {
  loading?: boolean;
  count?: number;
}

const NodeNoComments: FC<IProps> = ({ loading = false, count = 3 }) => {
  const items = useMemo(
    () =>
      [...new Array(count)].map((_, i) => (
        <div className={styles.card} key={i} />
      )),
    [count],
  );

  return (
    <Group className={classNames(styles.wrap, { [styles.loading]: loading })}>
      {items}
      {!loading && (
        <div className={styles.nothing}>{t(ERRORS.NO_COMMENTS)}</div>
      )}
    </Group>
  );
};

export { NodeNoComments };
