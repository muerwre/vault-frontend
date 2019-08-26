import { takeLatest, call, put, select, delay } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import { NODE_ACTIONS, EMPTY_NODE } from './constants';
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
} from './actions';
import { postNode, getNode, postNodeComment } from './api';
import { reqWrapper } from '../auth/sagas';
import { flowSetNodes } from '../flow/actions';
import { ERRORS } from '~/constants/errors';
import { modalSetShown } from '../modal/actions';
import { selectFlowNodes } from '../flow/selectors';
import { URLS } from '~/constants/urls';
import { selectNode } from './selectors';

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
  yield put(flowSetNodes([result, ...nodes]));
  return yield put(modalSetShown(false));
}

function* onNodeLoad({ id, node_type }: ReturnType<typeof nodeLoadNode>) {
  yield put(nodeSetLoading(true));
  yield put(nodeSetLoadingComments(true));
  yield put(nodeSetSaveErrors({}));

  if (node_type) yield put(nodeSetCurrent({ ...EMPTY_NODE, type: node_type }));

  yield put(push(URLS.NODE_URL(id)));

  const {
    data: { node, error },
  } = yield call(getNode, { id });

  yield put(nodeSetLoading(false));

  if (error) {
    return yield put(nodeSetSaveErrors({ error }));
  }

  yield put(nodeSetSaveErrors({}));
  yield put(nodeSetCurrent(node));

  // todo: load comments
  yield delay(500);
  yield put(nodeSetLoadingComments(false));

  return;
}

function* onPostComment({ data, id }: ReturnType<typeof nodePostComment>) {
  yield put(nodeSetSendingComment(true));
  const {
    data: { comment },
    error,
  } = yield call(reqWrapper, postNodeComment, { data, id });
  yield put(nodeSetSendingComment(false));

  if (error || !comment) {
    return yield put(nodeSetSaveErrors({ error: error || ERRORS.EMPTY_RESPONSE }));
  }

  console.log({ comment });

  const { comments } = yield select(selectNode);

  yield put(nodeSetComments([...comments, comment]));
}

export default function* nodeSaga() {
  yield takeLatest(NODE_ACTIONS.SAVE, onNodeSave);
  yield takeLatest(NODE_ACTIONS.LOAD_NODE, onNodeLoad);
  yield takeLatest(NODE_ACTIONS.POST_COMMENT, onPostComment);
}
