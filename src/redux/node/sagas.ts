import { takeLatest, call, put, select, delay, all } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import { NODE_ACTIONS, EMPTY_NODE, EMPTY_COMMENT, NODE_EDITOR_DATA } from './constants';
import {
  nodeSave,
  nodeSetSaveErrors,
  nodeLoadNode,
  nodeSetLoading,
  nodeSetCurrent,
  nodeSetLoadingComments,
  nodePostComment,
  nodeSetSendingComment,
  nodeSetComments,
  nodeSetCommentData,
  nodeUpdateTags,
  nodeSetTags,
  nodeCreate,
  nodeSetEditor,
  nodeEdit,
  nodeLike,
  nodeSetRelated,
  nodeGotoNode,
  nodeLock,
  nodeLockComment,
} from './actions';
import {
  postNode,
  getNode,
  postNodeComment,
  getNodeComments,
  updateNodeTags,
  postNodeLike,
  postNodeStar,
  getNodeRelated,
  postNodeLock,
  postNodeLockComment,
} from './api';
import { reqWrapper } from '../auth/sagas';
import { flowSetNodes, flowSetUpdated } from '../flow/actions';
import { ERRORS } from '~/constants/errors';
import { modalSetShown, modalShowDialog } from '../modal/actions';
import { selectFlowNodes, selectFlow } from '../flow/selectors';
import { URLS } from '~/constants/urls';
import { selectNode } from './selectors';
import { IResultWithStatus, INode } from '../types';
import { NODE_EDITOR_DIALOGS } from '~/constants/dialogs';
import { DIALOGS } from '~/redux/modal/constants';
import { INodeState } from './reducer';
import { IFlowState } from '../flow/reducer';

export function* updateNodeEverywhere(node) {
  const {
    current: { id },
  }: INodeState = yield select(selectNode);
  const flow_nodes: IFlowState['nodes'] = yield select(selectFlowNodes);

  if (id === node.id) {
    yield put(nodeSetCurrent(node));
  }

  yield put(
    flowSetNodes(
      flow_nodes
        .map(flow_node => (flow_node.id === node.id ? node : flow_node))
        .filter(flow_node => !flow_node.deleted_at)
    )
  );
}

function* onNodeSave({ node }: ReturnType<typeof nodeSave>) {
  yield put(nodeSetSaveErrors({}));

  const {
    data: { errors, node: result },
  } = yield call(reqWrapper, postNode, { node });

  if (errors && Object.values(errors).length > 0) {
    return yield put(nodeSetSaveErrors(errors));
  }

  if (!result || !result.id) {
    return yield put(nodeSetSaveErrors({ error: ERRORS.EMPTY_RESPONSE }));
  }

  const nodes = yield select(selectFlowNodes);
  const updated_flow_nodes = node.id
    ? nodes.map(item => (item.id === result.id ? result : item))
    : [result, ...nodes];

  yield put(flowSetNodes(updated_flow_nodes));

  const { current } = yield select(selectNode);

  if (node.id && current.id === result.id) {
    yield put(nodeSetCurrent(result));
  }

  return yield put(modalSetShown(false));
}

function* onNodeGoto({ id, node_type }: ReturnType<typeof nodeGotoNode>) {
  if (node_type) yield put(nodeSetCurrent({ ...EMPTY_NODE, type: node_type }));

  yield put(nodeLoadNode(id));
  yield put(nodeSetCommentData(0, { ...EMPTY_COMMENT }));
  yield put(nodeSetRelated(null));

  yield put(push(URLS.NODE_URL(id)));
}

function* onNodeLoad({ id, order = 'ASC' }: ReturnType<typeof nodeLoadNode>) {
  yield put(nodeSetLoading(true));
  yield put(nodeSetLoadingComments(true));

  const {
    data: { node, error },
  } = yield call(reqWrapper, getNode, { id });

  if (error || !node || !node.id) {
    yield put(push(URLS.ERRORS.NOT_FOUND));
    yield put(nodeSetLoading(false));
    return;
  }

  yield put(nodeSetCurrent(node));
  yield put(nodeSetLoading(false));

  const {
    comments: {
      data: { comments },
    },
    related: {
      data: { related },
    },
  } = yield all({
    comments: call(reqWrapper, getNodeComments, { id, order }),
    related: call(reqWrapper, getNodeRelated, { id }),
  });

  yield put(nodeSetComments(comments || []));
  yield put(nodeSetRelated(related || []));
  yield put(nodeSetLoadingComments(false));

  const { updated } = yield select(selectFlow);

  if (updated.some(item => item.id === id)) {
    yield put(flowSetUpdated(updated.filter(item => item.id !== id)));
  }

  return;
}

function* onPostComment({ id, is_before }: ReturnType<typeof nodePostComment>) {
  const { current, comment_data } = yield select(selectNode);

  yield put(nodeSetSendingComment(true));
  const {
    data: { comment },
    error,
  } = yield call(reqWrapper, postNodeComment, { data: comment_data[id], id: current.id });
  yield put(nodeSetSendingComment(false));

  if (error || !comment) {
    return yield put(nodeSetSaveErrors({ error: error || ERRORS.EMPTY_RESPONSE }));
  }

  const { current: current_node } = yield select(selectNode);

  if (current_node && current_node.id === current.id) {
    // if user still browsing that node
    const { comments } = yield select(selectNode);
    yield put(nodeSetCommentData(0, { ...EMPTY_COMMENT }));

    if (is_before) {
      yield put(nodeSetComments([comment, ...comments]));
    } else {
      yield put(nodeSetComments([...comments, comment]));
    }
  }
}

function* onUpdateTags({ id, tags }: ReturnType<typeof nodeUpdateTags>) {
  yield delay(1000);
  const {
    data: { node },
  }: IResultWithStatus<{ node: INode }> = yield call(reqWrapper, updateNodeTags, { id, tags });

  const { current } = yield select(selectNode);

  if (!node || !node.id || node.id !== current.id) return;

  yield put(nodeSetTags(node.tags));
}

function* onCreateSaga({ node_type: type }: ReturnType<typeof nodeCreate>) {
  if (!NODE_EDITOR_DIALOGS[type]) return;

  yield put(nodeSetEditor({ ...EMPTY_NODE, ...(NODE_EDITOR_DATA[type] || {}), type }));
  yield put(modalShowDialog(NODE_EDITOR_DIALOGS[type]));
}

function* onEditSaga({ id }: ReturnType<typeof nodeEdit>) {
  yield put(modalShowDialog(DIALOGS.LOADING));

  const {
    data: { node },
    error,
  } = yield call(reqWrapper, getNode, { id });

  if (error || !node || !node.type || !NODE_EDITOR_DIALOGS[node.type])
    return yield put(modalSetShown(false));

  yield put(nodeSetEditor(node));
  yield put(modalShowDialog(NODE_EDITOR_DIALOGS[node.type]));

  return true;
}

function* onLikeSaga({ id }: ReturnType<typeof nodeLike>) {
  const {
    current,
    current: { is_liked },
  } = yield select(selectNode);

  yield call(updateNodeEverywhere, { ...current, is_liked: !is_liked });

  const { data, error } = yield call(reqWrapper, postNodeLike, { id });

  if (!error || data.is_liked === !is_liked) return; // ok and matches

  yield call(updateNodeEverywhere, { ...current, is_liked });
}

function* onStarSaga({ id }: ReturnType<typeof nodeLike>) {
  const {
    current,
    current: { is_heroic },
  } = yield select(selectNode);

  yield call(updateNodeEverywhere, { ...current, is_heroic: !is_heroic });

  const { data, error } = yield call(reqWrapper, postNodeStar, { id });

  if (!error || data.is_heroic === !is_heroic) return; // ok and matches

  yield call(updateNodeEverywhere, { ...current, is_heroic });
}

function* onLockSaga({ id, is_locked }: ReturnType<typeof nodeLock>) {
  const {
    current,
    current: { deleted_at },
  } = yield select(selectNode);

  yield call(updateNodeEverywhere, {
    ...current,
    deleted_at: is_locked ? new Date().toISOString() : null,
  });

  const { error } = yield call(reqWrapper, postNodeLock, { id, is_locked });

  if (error) return yield call(updateNodeEverywhere, { ...current, deleted_at });
}

function* onLockCommentSaga({ id, is_locked }: ReturnType<typeof nodeLockComment>) {
  const { current, comments } = yield select(selectNode);

  yield put(
    nodeSetComments(
      comments.map(comment =>
        comment.id === id
          ? { ...comment, deleted_at: is_locked ? new Date().toISOString() : null }
          : comment
      )
    )
  );

  yield call(reqWrapper, postNodeLockComment, { current: current.id, id, is_locked });
}

export default function* nodeSaga() {
  yield takeLatest(NODE_ACTIONS.SAVE, onNodeSave);
  yield takeLatest(NODE_ACTIONS.GOTO_NODE, onNodeGoto);
  yield takeLatest(NODE_ACTIONS.LOAD_NODE, onNodeLoad);
  yield takeLatest(NODE_ACTIONS.POST_COMMENT, onPostComment);
  yield takeLatest(NODE_ACTIONS.UPDATE_TAGS, onUpdateTags);
  yield takeLatest(NODE_ACTIONS.CREATE, onCreateSaga);
  yield takeLatest(NODE_ACTIONS.EDIT, onEditSaga);
  yield takeLatest(NODE_ACTIONS.LIKE, onLikeSaga);
  yield takeLatest(NODE_ACTIONS.STAR, onStarSaga);
  yield takeLatest(NODE_ACTIONS.LOCK, onLockSaga);
  yield takeLatest(NODE_ACTIONS.LOCK_COMMENT, onLockCommentSaga);
}
