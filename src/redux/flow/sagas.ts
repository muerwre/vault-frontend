import { takeLatest, call, put, select } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import { FLOW_ACTIONS } from './constants';
import { getNodes } from '../node/api';
import { flowSetNodes, flowSetCellView, flowSetHeroes } from './actions';
import { IResultWithStatus, INode } from '../types';
import { selectFlowNodes } from './selectors';
import { reqWrapper } from '../auth/sagas';
import { postCellView } from './api';
import { IFlowState } from './reducer';

function* onGetFlow() {
  const {
    data: { nodes = null, heroes = null },
  }: IResultWithStatus<{ nodes: IFlowState['nodes']; heroes: IFlowState['heroes'] }> = yield call(
    getNodes,
    {}
  );

  if (!nodes || !nodes.length) {
    yield put(flowSetNodes([]));
    yield put(flowSetHeroes([]));
    return;
  }

  yield put(flowSetNodes(nodes));
  yield put(flowSetHeroes(heroes));
}

function* onSetCellView({ id, flow }: ReturnType<typeof flowSetCellView>) {
  const nodes = yield select(selectFlowNodes);
  yield put(flowSetNodes(nodes.map(node => (node.id === id ? { ...node, flow } : node))));

  const { data, error } = yield call(reqWrapper, postCellView, { id, flow });

  console.log({ data, error });
}

export default function* nodeSaga() {
  yield takeLatest([FLOW_ACTIONS.GET_FLOW, REHYDRATE], onGetFlow);
  yield takeLatest(FLOW_ACTIONS.SET_CELL_VIEW, onSetCellView);
}
