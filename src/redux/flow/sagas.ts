import { takeLatest, call, put } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import { FLOW_ACTIONS } from './constants';
import { getNodes } from '../node/api';
import { flowSetNodes } from './actions';
import { objFromArray } from '~/utils/fn';
import { IResultWithStatus, INode } from '../types';

function* onGetFlow() {
  const {
    data: { nodes = null },
    error,
  }: IResultWithStatus<{ nodes: INode[] }> = yield call(getNodes, {});

  if (!nodes || !nodes.length) {
    yield put(flowSetNodes([]));
    return;
  }

  yield put(flowSetNodes(nodes));
}

export default function* nodeSaga() {
  yield takeLatest([FLOW_ACTIONS.GET_FLOW, REHYDRATE], onGetFlow);
}
