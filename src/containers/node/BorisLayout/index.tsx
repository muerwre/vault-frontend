import React, { FC, useEffect } from 'react';
import { selectNode, selectNodeComments } from '~/redux/node/selectors';
import { selectUser } from '~/redux/auth/selectors';
import { useDispatch } from 'react-redux';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import boris from '~/sprites/boris_robot.svg';
import { useRandomPhrase } from '~/constants/phrases';
import isBefore from 'date-fns/isBefore';
import { BorisStats } from '~/components/boris/BorisStats';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectBorisStats } from '~/redux/boris/selectors';
import { authSetUser } from '~/redux/auth/actions';
import { nodeLoadNode } from '~/redux/node/actions';
import { borisLoadStats } from '~/redux/boris/actions';
import { Container } from '~/containers/main/Container';
import StickyBox from 'react-sticky-box/dist/esnext';
import { BorisComments } from '~/components/boris/BorisComments';
import { URLS } from '~/constants/urls';
import { Route, Switch } from 'react-router-dom';
import { BorisUIDemo } from '~/components/boris/BorisUIDemo';

type IProps = {};

const BorisLayout: FC<IProps> = () => {
  const title = useRandomPhrase('BORIS_TITLE');
  const dispatch = useDispatch();
  const node = useShallowSelect(selectNode);
  const user = useShallowSelect(selectUser);
  const stats = useShallowSelect(selectBorisStats);
  const comments = useShallowSelect(selectNodeComments);

  useEffect(() => {
    const last_comment = comments[0];

    if (!last_comment) return;

    if (
      user.last_seen_boris &&
      last_comment.created_at &&
      !isBefore(new Date(user.last_seen_boris), new Date(last_comment.created_at))
    )
      return;

    dispatch(authSetUser({ last_seen_boris: last_comment.created_at }));
  }, [user.last_seen_boris, dispatch, comments]);

  useEffect(() => {
    if (node.is_loading) return;
    dispatch(nodeLoadNode(696, 'DESC'));
  }, [dispatch]);

  useEffect(() => {
    dispatch(borisLoadStats());
  }, [dispatch]);

  return (
    <Container>
      <div className={styles.wrap}>
        <div className={styles.cover} />

        <div className={styles.image}>
          <div className={styles.caption}>
            <div className={styles.caption_text}>{title}</div>
          </div>

          <img src={boris} alt="Борис" />
        </div>

        <div className={styles.container}>
          {
            <Switch>
              <Route path={`${URLS.BORIS}/ui`} component={BorisUIDemo} />

              <BorisComments
                isLoadingComments={node.is_loading_comments}
                commentCount={node.comment_count}
                node={node.current}
                comments={node.comments}
              />
            </Switch>
          }

          <Group className={styles.stats}>
            <StickyBox className={styles.sticky} offsetTop={72} offsetBottom={10}>
              <Group className={styles.stats__container}>
                <div className={styles.stats__about}>
                  <h4>Господи-боженьки, где это я?</h4>

                  <p>
                    Всё впорядке, это &mdash; главный штаб Суицидальных Роботов, строителей Убежища.
                  </p>
                  <p>Здесь мы сидим и слушаем всё, что вас беспокоит.</p>
                  <p>Все виновные будут наказаны. Невиновные, впрочем, тоже. </p>
                  <p className="grey">//&nbsp;Такова&nbsp;жизнь.</p>
                </div>

                <div className={styles.stats__wrap}>
                  <BorisStats stats={stats} />
                </div>
              </Group>
            </StickyBox>
          </Group>
        </div>
      </div>
    </Container>
  );
};

export { BorisLayout };
