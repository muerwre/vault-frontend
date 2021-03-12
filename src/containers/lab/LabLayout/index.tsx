import React, { FC, useEffect } from 'react';
import styles from './styles.module.scss';
import { Card } from '~/components/containers/Card';
import { Sticky } from '~/components/containers/Sticky';
import { Container } from '~/containers/main/Container';
import { LabGrid } from '~/containers/lab/LabGrid';
import { useDispatch } from 'react-redux';
import { labGetList } from '~/redux/lab/actions';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { Grid } from '~/components/containers/Grid';
import { Group } from '~/components/containers/Group';
import { LabHero } from '~/components/lab/LabHero';
import { LabBanner } from '~/components/lab/LabBanner';

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
              <Group>
                <LabBanner />

                <Card>
                  <Group>
                    <Placeholder height={32} width="100%" />

                    <div />

                    <Placeholder height={14} width="100px" />

                    <div />

                    <div className={styles.tags}>
                      <Placeholder height={20} width="100px" />
                      <Placeholder height={20} width="64px" />
                      <Placeholder height={20} width="100%" />
                      <Placeholder height={20} width="100px" />
                      <Placeholder height={20} width="100px" />
                      <Placeholder height={20} width="64px" />
                    </div>

                    <div />

                    <Placeholder height={14} width="180px" />

                    <div />

                    <Group className={styles.heroes}>
                      <LabHero />
                      <div />
                      <LabHero />
                      <div />
                      <LabHero />
                      <div />
                      <LabHero />
                      <div />
                      <LabHero />
                      <div />
                      <LabHero />
                      <div />
                      <LabHero />
                    </Group>

                    <div />
                  </Group>
                </Card>
              </Group>
            </Sticky>
          </div>
        </div>
      </Container>
    </div>
  );
};

export { LabLayout };
