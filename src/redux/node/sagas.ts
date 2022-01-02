import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';

import { COMMENTS_DISPLAY, EMPTY_NODE, NODE_ACTIONS } from './constants';
import {
  nodeGotoNode,
  nodeLoadNode,
  nodeLockComment,
  nodePostLocalComment,
  nodeSet,
  nodeSetComments,
  nodeSetLoadingComments,
} from './actions';
import { apiGetNodeComments, apiLockComment, apiPostComment } from './api';
import { flowSetNodes } from '../flow/actions';
import { selectFlowNodes } from '../flow/selectors';
import { selectNode } from './selectors';
import { INode, Unwrap } from '../types';
import { showErrorToast } from '~/utils/errors/showToast';

export function* updateNodeEverywhere(node) {
  const {
    current: { id },
  }: ReturnType<typeof selectNode> = yield select(selectNode);

  const flow_nodes: ReturnType<typeof selectFlowNodes> = yield select(selectFlowNodes);

  yield put(
    flowSetNodes(
      flow_nodes
        .map(flow_node => (flow_node.id === node.id ? node : flow_node))
        .filter(flow_node => !flow_node.deleted_at)
    )
  );
}

function* onNodeGoto({ id }: ReturnType<typeof nodeGotoNode>) {
  if (!id) {
    return;
  }

  yield put(nodeLoadNode(id));
}

function* onNodeLoadMoreComments() {
  try {
    const {
      current: { id },
      comments,
    }: ReturnType<typeof selectNode> = yield select(selectNode);

    if (!id) {
      return;
    }

    const data: Unwrap<typeof apiGetNodeComments> = yield call(apiGetNodeComments, {
      id,
      take: COMMENTS_DISPLAY,
      skip: comments.length,
    });

    const current: ReturnType<typeof selectNode> = yield select(selectNode);

    if (!data || current.current.id != id) {
      return;
    }

    yield put(
      nodeSet({
        comments: [...comments, ...data.comments],
        comment_count: data.comment_count,
      })
    );
  } catch (error) {}
}

function* nodeGetComments(id: INode['id']) {
  try {
    const { comments, comment_count }: Unwrap<typeof apiGetNodeComments> = yield call(
      apiGetNodeComments,
      {
        id: id!,
        take: COMMENTS_DISPLAY,
        skip: 0,
      }
    );

    yield put(
      nodeSet({
        comments,
        comment_count,
      })
    );
  } catch {}
}

function* onNodeLoad({ id }: ReturnType<typeof nodeLoadNode>) {
  // Comments
  try {
    yield put(nodeSetLoadingComments(true));
    yield call(nodeGetComments, id);

    yield put(
      nodeSet({
        is_loading_comments: false,
      })
    );
  } catch {}
}

function* onPostComment({ nodeId, comment, callback }: ReturnType<typeof nodePostLocalComment>) {
  try {
    const data: Unwrap<typeof apiPostComment> = yield call(apiPostComment, {
      data: comment,
      id: nodeId,
    });

    const { comments }: ReturnType<typeof selectNode> = yield select(selectNode);

    if (!comment.id) {
      yield put(nodeSetComments([data.comment, ...comments]));
    } else {
      yield put(
        nodeSet({
          comments: comments.map(item => (item.id === comment.id ? data.comment : item)),
        })
      );
    }

    callback();
  } catch (error) {
    return callback(error.message);
  }
}

function* onLockCommentSaga({ nodeId, id, is_locked }: ReturnType<typeof nodeLockComment>) {
  const { comments }: ReturnType<typeof selectNode> = yield select(selectNode);

  try {
    const data: Unwrap<typeof apiLockComment> = yield call(apiLockComment, {
      current: nodeId,
      id,
      is_locked,
    });

    yield put(
      nodeSetComments(
        comments.map(comment =>
          comment.id === id ? { ...comment, deleted_at: data.deleted_at || undefined } : comment
        )
      )
    );
  } catch (e) {
    showErrorToast(e);
  }
}

export default function* nodeSaga() {
  yield takeLatest(NODE_ACTIONS.GOTO_NODE, onNodeGoto);
  yield takeLatest(NODE_ACTIONS.LOAD_NODE, onNodeLoad);
  yield takeLatest(NODE_ACTIONS.POST_LOCAL_COMMENT, onPostComment);
  yield takeLatest(NODE_ACTIONS.LOCK_COMMENT, onLockCommentSaga);
  yield takeLeading(NODE_ACTIONS.LOAD_MORE_COMMENTS, onNodeLoadMoreComments);
}
