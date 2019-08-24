import { takeLatest, call, put } from 'redux-saga/effects';
import { NODE_ACTIONS } from './constants';
import { nodeSave, nodeSetSaveErrors } from './actions';
import { postNode } from './api';
import { reqWrapper } from '../auth/sagas';
import { flowSetNodes } from '../flow/actions';
import { ERRORS } from '~/constants/errors';
import { modalSetShown } from '../modal/actions';

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

  yield put(flowSetNodes({ [result.id]: result }));
  yield put(modalSetShown(false));
}

export default function* nodeSaga() {
  yield takeLatest(NODE_ACTIONS.SAVE, onNodeSave);
}
