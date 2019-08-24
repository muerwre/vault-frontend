import { takeLatest, call } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import { FLOW_ACTIONS } from './constants';
import { getNodes } from '../node/api';

function* onGetFlow() {
  const { data, error } = yield call(getNodes, {});

  console.log('flow', { data, error });
}

export default function* nodeSaga() {
  yield takeLatest([FLOW_ACTIONS.GET_FLOW, REHYDRATE], onGetFlow);
}
