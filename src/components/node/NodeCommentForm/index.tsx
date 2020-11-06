import React, { FC, useCallback, KeyboardEventHandler, useEffect, useMemo } from 'react';
import { Textarea } from '~/components/input/Textarea';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import styles from './styles.module.scss';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import assocPath from 'ramda/es/assocPath';
import { InputHandler, IFileWithUUID, IFile } from '~/redux/types';
import { connect } from 'react-redux';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { selectNode } from '~/redux/node/selectors';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { IState } from '~/redux/store';
import { selectUser, selectAuthUser } from '~/redux/auth/selectors';
import { CommentForm } from '../CommentForm';

const mapStateToProps = state => ({
  user: selectAuthUser(state),
});

type IProps = ReturnType<typeof mapStateToProps> & {
  is_before?: boolean;
};

const NodeCommentFormUnconnected: FC<IProps> = ({ user, is_before }) => {
  return (
    <CommentWrapper user={user}>
      <CommentForm id={0} is_before={is_before} />
    </CommentWrapper>
  );
};

const NodeCommentForm = connect(mapStateToProps)(NodeCommentFormUnconnected);

export { NodeCommentForm };
