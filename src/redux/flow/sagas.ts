import { takeLatest, call, put, select } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import { FLOW_ACTIONS } from './constants';
import { getNodes } from '../node/api';
import {
  flowSetNodes,
  flowSetCellView,
  flowSetHeroes,
  flowSetRecent,
  flowSetUpdated,
} from './actions';
import { IResultWithStatus, INode } from '../types';
import { selectFlowNodes } from './selectors';
import { reqWrapper } from '../auth/sagas';
import { postCellView } from './api';
import { IFlowState } from './reducer';

function* onGetFlow() {
  const {
    data: { nodes = null, heroes = null, recent = [], updated = [] },
  }: IResultWithStatus<{
    nodes: IFlowState['nodes'];
    heroes: IFlowState['heroes'];
    recent: IFlowState['recent'];
    updated: IFlowState['updated'];
  }> = yield call(reqWrapper, getNodes, {});

  if (!nodes || !nodes.length) {
    yield put(flowSetNodes([]));
    yield put(flowSetHeroes([]));
    yield put(flowSetRecent([]));
    yield put(flowSetUpdated([]));
    return;
  }

  yield put(flowSetNodes(nodes));
  yield put(flowSetHeroes(heroes));
  yield put(flowSetRecent(recent));
  yield put(flowSetUpdated(updated));

  document.getElementById('main_loader').style.display = 'none';
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
