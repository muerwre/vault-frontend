import { takeLatest, call, put, select, takeLeading, delay, race, take } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import { FLOW_ACTIONS } from './constants';
import { getNodeDiff } from '../node/api';
import {
  flowSetNodes,
  flowSetCellView,
  flowSetHeroes,
  flowSetRecent,
  flowSetUpdated,
  flowSetFlow,
  flowChangeSearch,
  flowSetSearch,
} from './actions';
import { IResultWithStatus, INode, Unwrap } from '../types';
import { selectFlowNodes, selectFlow } from './selectors';
import { reqWrapper } from '../auth/sagas';
import { postCellView, getSearchResults } from './api';
import { IFlowState } from './reducer';
import { uniq } from 'ramda';

function hideLoader() {
  document.getElementById('main_loader').style.display = 'none';
}

function* onGetFlow() {
  const {
    flow: { _persist },
  } = yield select();

  if (!_persist.rehydrated) return;

  const stored: IFlowState['nodes'] = yield select(selectFlowNodes);

  if (stored.length) {
    hideLoader();
  }

  yield put(flowSetFlow({ is_loading: true }));

  const {
    data: { before = [], after = [], heroes = [], recent = [], updated = [], valid = null },
  }: IResultWithStatus<{
    before: IFlowState['nodes'];
    after: IFlowState['nodes'];
    heroes: IFlowState['heroes'];
    recent: IFlowState['recent'];
    updated: IFlowState['updated'];
    valid: INode['id'][];
  }> = yield call(reqWrapper, getNodeDiff, {
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    with_heroes: true,
    with_updated: true,
    with_recent: true,
    with_valid: false,
  });

  const result = uniq([...(before || []), ...(after || [])]);

  yield put(flowSetFlow({ is_loading: false, nodes: result }));

  if (heroes.length) yield put(flowSetHeroes(heroes));
  if (recent.length) yield put(flowSetRecent(recent));
  if (updated.length) yield put(flowSetUpdated(updated));

  if (!stored.length) hideLoader();
}

function* onSetCellView({ id, flow }: ReturnType<typeof flowSetCellView>) {
  const nodes = yield select(selectFlowNodes);
  yield put(flowSetNodes(nodes.map(node => (node.id === id ? { ...node, flow } : node))));

  const { data, error } = yield call(reqWrapper, postCellView, { id, flow });

  // TODO: error handling
}

function* getMore() {
  yield put(flowSetFlow({ is_loading: true }));
  const nodes: IFlowState['nodes'] = yield select(selectFlowNodes);

  const start = nodes && nodes[0] && nodes[0].created_at;
  const end = nodes && nodes[nodes.length - 1] && nodes[nodes.length - 1].created_at;

  const { error, data } = yield call(reqWrapper, getNodeDiff, {
    start,
    end,
    with_heroes: false,
    with_updated: true,
    with_recent: true,
    with_valid: true,
  });

  if (error || !data) return;

  const result = uniq([
    ...(data.before || []),
    ...(data.valid ? nodes.filter(node => data.valid.includes(node.id)) : nodes),
    ...(data.after || []),
  ]);

  yield put(
    flowSetFlow({
      is_loading: false,
      nodes: result,
      ...(data.recent ? { recent: data.recent } : {}),
      ...(data.updated ? { updated: data.updated } : {}),
    })
  );

  yield delay(1000);
}

function* changeSearch({ search }: ReturnType<typeof flowChangeSearch>) {
  yield put(
    flowSetSearch({
      ...search,
      is_loading: !!search.text,
    })
  );

  if (!search.text) return;

  yield delay(500);

  const { data, error }: Unwrap<ReturnType<typeof getSearchResults>> = yield call(
    reqWrapper,
    getSearchResults,
    {
      ...search,
    }
  );

  if (error) {
    yield put(flowSetSearch({ is_loading: false, results: [], total: 0 }));
    return;
  }

  yield put(
    flowSetSearch({
      is_loading: false,
      results: data.nodes,
      total: data.total,
    })
  );
}

function* loadMoreSearch() {
  yield put(
    flowSetSearch({
      is_loading_more: true,
    })
  );

  const { search }: ReturnType<typeof selectFlow> = yield select(selectFlow);

  const {
    result,
    delay,
  }: { result: Unwrap<ReturnType<typeof getSearchResults>>; delay: any } = yield race({
    result: call(reqWrapper, getSearchResults, {
      ...search,
      skip: search.results.length,
    }),
    delay: take(FLOW_ACTIONS.CHANGE_SEARCH),
  });

  if (delay || result.error) {
    return put(flowSetSearch({ is_loading_more: false }));
  }

  yield put(
    flowSetSearch({
      results: [...search.results, ...result.data.nodes],
      total: result.data.total,
      is_loading_more: false,
    })
  );
}

export default function* nodeSaga() {
  yield takeLatest([FLOW_ACTIONS.GET_FLOW, REHYDRATE], onGetFlow);
  yield takeLatest(FLOW_ACTIONS.SET_CELL_VIEW, onSetCellView);
  yield takeLeading(FLOW_ACTIONS.GET_MORE, getMore);
  yield takeLatest(FLOW_ACTIONS.CHANGE_SEARCH, changeSearch);
  yield takeLatest(FLOW_ACTIONS.LOAD_MORE_SEARCH, loadMoreSearch);
}
