import { takeLatest, call, put, select } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import { FLOW_ACTIONS } from './constants';
import { getNodes } from '../node/api';
import { flowSetNodes, flowSetCellView } from './actions';
import { IResultWithStatus, INode } from '../types';
import { updateNodeEverywhere } from '../node/sagas';
import { selectFlowNodes } from './selectors';

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

function* onSetCellView({ id, flow }: ReturnType<typeof flowSetCellView>) {
  const nodes = yield select(selectFlowNodes);
  yield put(flowSetNodes(nodes.map(node => (node.id === id ? { ...node, flow } : node))));
}

export default function* nodeSaga() {
  yield takeLatest([FLOW_ACTIONS.GET_FLOW, REHYDRATE], onGetFlow);
  yield takeLatest(FLOW_ACTIONS.SET_CELL_VIEW, onSetCellView);
}
