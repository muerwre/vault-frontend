import React, { FC, useEffect } from 'react';
import styles from './styles.module.scss';
import { Card } from '~/components/containers/Card';
import { Sticky } from '~/components/containers/Sticky';
import { Container } from '~/containers/main/Container';
import { LabGrid } from '~/containers/lab/LabGrid';
import { useDispatch } from 'react-redux';
import { labGetList } from '~/redux/lab/actions';

interface IProps {}

const LabLayout: FC<IProps> = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(labGetList());
  }, [dispatch]);

  return (
    <div>
      <Container>
        <div className={styles.wrap}>
          <div className={styles.content}>
            <LabGrid />
          </div>
          <div className={styles.panel}>
            <Sticky>
              <Card>Test</Card>
            </Sticky>
          </div>
        </div>
      </Container>
    </div>
  );
};

export { LabLayout };
