import { takeLatest, call, put } from 'redux-saga/effects';
import { NODE_ACTIONS } from './constants';
import { nodeSave, nodeSetSaveErrors } from './actions';
import { postNode } from './api';
import { reqWrapper } from '../auth/sagas';

function* onNodeSave({ node }: ReturnType<typeof nodeSave>) {
  yield put(nodeSetSaveErrors({}));

  const {
    data,
    data: { errors },
  } = yield call(reqWrapper, postNode, { node });

  if (errors && Object.values(errors).length > 0) {
    return yield put(nodeSetSaveErrors(errors));
  }

  console.log({ data, errors });
}

export default function* nodeSaga() {
  yield takeLatest(NODE_ACTIONS.SAVE, onNodeSave);
}
