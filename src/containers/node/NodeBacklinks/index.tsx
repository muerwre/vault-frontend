import { FC, useMemo } from 'react';

import { SubTitle } from '~/components/common/SubTitle';
import { Card } from '~/components/containers/Card';
import { Padder } from '~/components/containers/Padder';
import { Backlink } from '~/components/node/Backlink';
import { NodeBackLink } from '~/types';
import { has } from '~/utils/ramda';

import { BACKLINK_TITLES, SOCIAL_ICONS } from '../../../constants/auth/socials';

import styles from './styles.module.scss';

interface NodeBacklinksProps {
  list?: NodeBackLink[];
}

const NodeBacklinks: FC<NodeBacklinksProps> = ({ list }) => {
  const validBacklinks = useMemo(
    () => (list || []).filter((it) => it.provider && it.link),
    [list],
  );

  if (!validBacklinks.length) {
    return null;
  }

  return (
    <div>
      <SubTitle className={styles.subtitle}>Расшарено:</SubTitle>

      <div className={styles.grid}>
        {validBacklinks.map((it) => (
          <Card elevation={-1} seamless key={it.link} className={styles.card}>
            <Backlink
              icon={SOCIAL_ICONS[it.provider]}
              title={
                has(it.provider, BACKLINK_TITLES)
                  ? BACKLINK_TITLES[it.provider]
                  : it.provider
              }
              subtitle={it.provider}
              link={it.link}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export { NodeBacklinks };