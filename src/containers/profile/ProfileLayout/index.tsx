import React, { FC, useEffect, useState } from 'react';
import { useRouteMatch, withRouter, RouteComponentProps } from 'react-router';
import styles from './styles.module.scss';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { Grid } from '~/components/containers/Grid';
import { CommentForm } from '~/components/node/CommentForm';
import { ProfileInfo } from '../ProfileInfo';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { connect } from 'react-redux';
import { IUser } from '~/redux/auth/types';
import { Group } from '~/components/containers/Group';

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  nodeSetCoverImage: NODE_ACTIONS.nodeSetCoverImage,
};

type IProps = RouteComponentProps & typeof mapDispatchToProps & {};

const ProfileLayoutUnconnected: FC<IProps> = ({ history, nodeSetCoverImage }) => {
  const {
    params: { username },
  } = useRouteMatch<{ username: string }>();
  const [user, setUser] = useState<IUser>(null);

  useEffect(() => {
    if (user) setUser(null);
  }, [username]);

  useEffect(() => {
    if (user && user.id && user.cover) {
      nodeSetCoverImage(user.cover);
      return () => nodeSetCoverImage(null);
    }
  }, [user]);

  return (
    <Group className={styles.wrap} horizontal>
      <div className={styles.column} />

      <Grid className={styles.content}>
        <div className={styles.comments}>
          <CommentForm id={0} />
          <NodeNoComments is_loading={false} />
        </div>
      </Grid>
    </Group>
  );
};

const ProfileLayout = connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ProfileLayoutUnconnected));

export { ProfileLayout };
