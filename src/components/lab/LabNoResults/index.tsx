import React, { VFC } from 'react';

import { Card } from '~/components/common/Card';
import { Button } from '~/components/input/Button';

import styles from './styles.module.scss';

interface LabNoResultsProps {
  resetSearch: () => void;
}

const LabNoResults: VFC<LabNoResultsProps> = ({ resetSearch }) => (
  <Card className={styles.wrap}>
    <div className={styles.title}> Здесь ничего нет</div>
    <Button onClick={resetSearch}>Сбросить поиск</Button>
  </Card>
);

export { LabNoResults };
