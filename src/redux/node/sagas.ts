import { all, call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import {
  COMMENTS_DISPLAY,
  EMPTY_COMMENT,
  EMPTY_NODE,
  NODE_ACTIONS,
  NODE_EDITOR_DATA,
} from './constants';
import {
  nodeCreate,
  nodeEdit,
  nodeGotoNode,
  nodeLike,
  nodeLoadNode,
  nodeLock,
  nodeLockComment,
  nodePostLocalComment,
  nodeSave,
  nodeSet,
  nodeSetCommentData,
  nodeSetComments,
  nodeSetCurrent,
  nodeSetEditor,
  nodeSetLoading,
  nodeSetLoadingComments,
  nodeSetRelated,
  nodeSetSaveErrors,
  nodeSetTags,
  nodeUpdateTags,
} from './actions';
import {
  apiGetNode,
  apiGetNodeComments,
  apiGetNodeRelated,
  apiLockComment,
  apiLockNode,
  apiPostComment,
  apiPostNode,
  apiPostNodeHeroic,
  apiPostNodeLike,
  apiPostNodeTags,
} from './api';
import { flowSetNodes, flowSetUpdated } from '../flow/actions';
import { ERRORS } from '~/constants/errors';
import { modalSetShown, modalShowDialog } from '../modal/actions';
import { selectFlow, selectFlowNodes } from '../flow/selectors';
import { URLS } from '~/constants/urls';
import { selectNode } from './selectors';
import { Unwrap } from '../types';
import { NODE_EDITOR_DIALOGS } from '~/constants/dialogs';
import { DIALOGS } from '~/redux/modal/constants';
import { has } from 'ramda';

export function* updateNodeEverywhere(node) {
  const {
    current: { id },
  }: ReturnType<typeof selectNode> = yield select(selectNode);

  const flow_nodes: ReturnType<typeof selectFlowNodes> = yield select(selectFlowNodes);

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
  try {
    yield put(nodeSetSaveErrors({}));

    const { errors, node: result }: Unwrap<typeof apiPostNode> = yield call(apiPostNode, { node });

    if (errors && Object.values(errors).length > 0) {
      yield put(nodeSetSaveErrors(errors));
      return;
    }

    const nodes: ReturnType<typeof selectFlowNodes> = yield select(selectFlowNodes);
    const updated_flow_nodes = node.id
      ? nodes.map(item => (item.id === result.id ? result : item))
      : [result, ...nodes];

    yield put(flowSetNodes(updated_flow_nodes));

    const { current } = yield select(selectNode);

    if (node.id && current.id === result.id) {
      yield put(nodeSetCurrent(result));
    }

    return yield put(modalSetShown(false));
  } catch (error) {
    yield put(nodeSetSaveErrors({ error: error.message || ERRORS.CANT_SAVE_NODE }));
  }
}

function* onNodeGoto({ id, node_type }: ReturnType<typeof nodeGotoNode>) {
  if (!id) {
    return;
  }
  if (node_type) yield put(nodeSetCurrent({ ...EMPTY_NODE, type: node_type }));

  yield put(nodeLoadNode(id));
  yield put(nodeSetCommentData(0, { ...EMPTY_COMMENT }));
  yield put(nodeSetRelated({ albums: {}, similar: [] }));
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

function* onNodeLoad({ id }: ReturnType<typeof nodeLoadNode>) {
  // Get node body
  try {
    yield put(nodeSetLoading(true));
    yield put(nodeSetLoadingComments(true));

    const { node }: Unwrap<typeof apiGetNode> = yield call(apiGetNode, { id });

    yield put(nodeSetCurrent(node));
    yield put(nodeSetLoading(false));
  } catch (error) {
    yield put(push(URLS.ERRORS.NOT_FOUND));
    yield put(nodeSetLoading(false));
  }

  // Comments and related
  try {
    const [{ comments, comment_count }, { related }]: [
      Unwrap<typeof apiGetNodeComments>,
      Unwrap<typeof apiGetNodeRelated>
    ] = yield all([
      call(apiGetNodeComments, { id, take: COMMENTS_DISPLAY, skip: 0 }),
      call(apiGetNodeRelated, { id }),
    ]);

    yield put(
      nodeSet({
        comments,
        comment_count,
        related,
        is_loading_comments: false,
      })
    );
  } catch {}

  // Remove current node from recently updated
  const { updated } = yield select(selectFlow);

  if (updated.some(item => item.id === id)) {
    yield put(flowSetUpdated(updated.filter(item => item.id !== id)));
  }
}

function* onPostComment({ nodeId, comment, callback }: ReturnType<typeof nodePostLocalComment>) {
  try {
    const data: Unwrap<typeof apiPostComment> = yield call(apiPostComment, {
      data: comment,
      id: nodeId,
    });

    const { current }: ReturnType<typeof selectNode> = yield select(selectNode);

    if (current?.id === nodeId) {
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
    }
  } catch (error) {
    return callback(error.message);
  }
}

function* onUpdateTags({ id, tags }: ReturnType<typeof nodeUpdateTags>) {
  try {
    const { node }: Unwrap<typeof apiPostNodeTags> = yield call(apiPostNodeTags, { id, tags });
    const { current }: ReturnType<typeof selectNode> = yield select(selectNode);
    if (!node || !node.id || node.id !== current.id) return;
    yield put(nodeSetTags(node.tags));
  } catch {}
}

function* onCreateSaga({ node_type: type, isLab }: ReturnType<typeof nodeCreate>) {
  if (!type || !has(type, NODE_EDITOR_DIALOGS)) return;

  yield put(
    nodeSetEditor({
      ...EMPTY_NODE,
      ...(NODE_EDITOR_DATA[type] || {}),
      type,
      is_promoted: !isLab,
    })
  );

  yield put(modalShowDialog(NODE_EDITOR_DIALOGS[type]));
}

function* onEditSaga({ id }: ReturnType<typeof nodeEdit>) {
  try {
    if (!id) {
      return;
    }

    yield put(modalShowDialog(DIALOGS.LOADING));

    const { node }: Unwrap<typeof apiGetNode> = yield call(apiGetNode, { id });

    if (!node.type || !has(node.type, NODE_EDITOR_DIALOGS)) return;

    if (!NODE_EDITOR_DIALOGS[node?.type]) {
      throw new Error('Unknown node type');
    }

    yield put(nodeSetEditor(node));
    yield put(modalShowDialog(NODE_EDITOR_DIALOGS[node.type]));
  } catch (error) {
    yield put(modalSetShown(false));
  }
}

function* onLikeSaga({ id }: ReturnType<typeof nodeLike>) {
  const { current }: ReturnType<typeof selectNode> = yield select(selectNode);

  try {
    const count = current.like_count || 0;

    yield call(updateNodeEverywhere, {
      ...current,
      is_liked: !current.is_liked,
      like_count: current.is_liked ? Math.max(count - 1, 0) : count + 1,
    });

    const data: Unwrap<typeof apiPostNodeLike> = yield call(apiPostNodeLike, { id });

    yield call(updateNodeEverywhere, {
      ...current,
      is_liked: data.is_liked,
      like_count: data.is_liked ? count + 1 : Math.max(count - 1, 0),
    });
  } catch {}
}

function* onStarSaga({ id }: ReturnType<typeof nodeLike>) {
  try {
    const {
      current,
      current: { is_heroic },
    } = yield select(selectNode);

    yield call(updateNodeEverywhere, { ...current, is_heroic: !is_heroic });

    const data: Unwrap<typeof apiPostNodeHeroic> = yield call(apiPostNodeHeroic, { id });

    yield call(updateNodeEverywhere, { ...current, is_heroic: data.is_heroic });
  } catch {}
}

function* onLockSaga({ id, is_locked }: ReturnType<typeof nodeLock>) {
  const { current }: ReturnType<typeof selectNode> = yield select(selectNode);

  try {
    yield call(updateNodeEverywhere, {
      ...current,
      deleted_at: is_locked ? new Date().toISOString() : null,
    });

    const data: Unwrap<typeof apiLockNode> = yield call(apiLockNode, { id, is_locked });

    yield call(updateNodeEverywhere, {
      ...current,
      deleted_at: data.deleted_at || undefined,
    });
  } catch {
    yield call(updateNodeEverywhere, { ...current, deleted_at: current.deleted_at });
  }
}

function* onLockCommentSaga({ id, is_locked }: ReturnType<typeof nodeLockComment>) {
  const { current, comments }: ReturnType<typeof selectNode> = yield select(selectNode);

  try {
    yield put(
      nodeSetComments(
        comments.map(comment =>
          comment.id === id
            ? { ...comment, deleted_at: is_locked ? new Date().toISOString() : undefined }
            : comment
        )
      )
    );

    const data: Unwrap<typeof apiLockComment> = yield call(apiLockComment, {
      current: current.id,
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
  } catch {
    yield put(
      nodeSetComments(
        comments.map(comment =>
          comment.id === id ? { ...comment, deleted_at: current.deleted_at } : comment
        )
      )
    );
  }
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
  yield takeLeading(NODE_ACTIONS.LOAD_MORE_COMMENTS, onNodeLoadMoreComments);
}
