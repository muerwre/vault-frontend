import { takeLatest, call } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import { FLOW_ACTIONS } from './constants';
import { getNodes } from '../node/api';
import { flowSetNodes } from './actions';

function* onGetFlow() {
  const {
    data: { nodes = null },
    error,
  } = yield call(getNodes, {});

  if (!nodes) {
    // todo: set error empty response
  }

  // todo: write nodes
  // yield put(flowSetNodes());

  console.log('flow', { nodes, error });
}

export default function* nodeSaga() {
  yield takeLatest([FLOW_ACTIONS.GET_FLOW, REHYDRATE], onGetFlow);
}
