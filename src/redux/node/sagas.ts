import { takeLatest, call, put, select, delay } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import { NODE_ACTIONS } from './constants';
import { nodeSave, nodeSetSaveErrors, nodeLoadNode, nodeSetLoading } from './actions';
import { postNode } from './api';
import { reqWrapper } from '../auth/sagas';
import { flowSetNodes } from '../flow/actions';
import { ERRORS } from '~/constants/errors';
import { modalSetShown } from '../modal/actions';
import { selectFlowNodes } from '../flow/selectors';
import { URLS } from '~/constants/urls';

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

function* onNodeLoad({ id }: ReturnType<typeof nodeLoadNode>) {
  yield put(nodeSetLoading(true));
  yield put(nodeSetSaveErrors({}));

  yield put(push(URLS.NODE_URL(id)));

  yield delay(1000);

  yield put(nodeSetLoading(false));
  yield put(nodeSetSaveErrors({}));
}

export default function* nodeSaga() {
  yield takeLatest(NODE_ACTIONS.SAVE, onNodeSave);
  yield takeLatest(NODE_ACTIONS.LOAD_NODE, onNodeLoad);
}
