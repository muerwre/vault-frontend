import { takeLatest, call } from 'redux-saga/effects';
import { NODE_ACTIONS } from './constants';
import { nodeSave } from './actions';
import { postNode } from './api';
import { reqWrapper } from '../auth/sagas';

function* onNodeSave({ node }: ReturnType<typeof nodeSave>) {
  const { data, errors } = yield call(reqWrapper, postNode, { node });

  console.log({ data, errors });
}

export default function* nodeSaga() {
  yield takeLatest(NODE_ACTIONS.SAVE, onNodeSave);
}
