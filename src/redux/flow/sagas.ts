import { call, delay, put, race, select, take, takeLatest, takeLeading } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import { FLOW_ACTIONS } from './constants';
import { getNodeDiff } from '../node/api';
import {
  flowChangeSearch,
  flowSetCellView,
  flowSetFlow,
  flowSetHeroes,
  flowSetNodes,
  flowSetRecent,
  flowSetSearch,
  flowSetUpdated,
} from './actions';
import { Unwrap } from '../types';
import { selectFlow, selectFlowNodes } from './selectors';
import { getSearchResults, postCellView } from './api';
import { uniq } from 'ramda';
import { labSeenNode } from '~/redux/lab/actions';

function hideLoader() {
  const loader = document.getElementById('main_loader');

  if (!loader) {
    return;
  }

  loader.style.display = 'none';
}

function* onGetFlow() {
  try {
    const {
      flow: { _persist },
    } = yield select();

    if (!_persist.rehydrated) return;

    const stored: ReturnType<typeof selectFlowNodes> = yield select(selectFlowNodes);

    if (stored.length) {
      hideLoader();
    }

    yield put(flowSetFlow({ isLoading: true }));

    const {
      before = [],
      after = [],
      heroes = [],
      recent = [],
      updated = [],
    }: Unwrap<typeof getNodeDiff> = yield call(getNodeDiff, {
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      with_heroes: true,
      with_updated: true,
      with_recent: true,
      with_valid: false,
    });

    const result = uniq([...(before || []), ...(after || [])]);

    yield put(flowSetFlow({ isLoading: false, nodes: result }));

    if (heroes.length) yield put(flowSetHeroes(heroes));
    if (recent.length) yield put(flowSetRecent(recent));
    if (updated.length) yield put(flowSetUpdated(updated));

    if (!stored.length) hideLoader();
  } catch (error) {
    console.log(error);
  }
}

function* onSetCellView({ id, flow }: ReturnType<typeof flowSetCellView>) {
  try {
    const nodes: ReturnType<typeof selectFlowNodes> = yield select(selectFlowNodes);
    yield put(flowSetNodes(nodes.map(node => (node.id === id ? { ...node, flow } : node))));
    yield call(postCellView, { id, flow });
  } catch (error) {
    console.log(error);
  }
}

function* getMore() {
  try {
    yield put(flowSetFlow({ isLoading: true }));
    const nodes: ReturnType<typeof selectFlowNodes> = yield select(selectFlowNodes);

    const start = nodes && nodes[0] && nodes[0].created_at;
    const end = nodes && nodes[nodes.length - 1] && nodes[nodes.length - 1].created_at;

    const data: Unwrap<typeof getNodeDiff> = yield call(getNodeDiff, {
      start,
      end,
      with_heroes: false,
      with_updated: true,
      with_recent: true,
      with_valid: true,
    });

    const result = uniq([
      ...(data.before || []),
      ...(data.valid ? nodes.filter(node => data.valid.includes(node.id)) : nodes),
      ...(data.after || []),
    ]);

    yield put(
      flowSetFlow({
        isLoading: false,
        nodes: result,
        ...(data.recent ? { recent: data.recent } : {}),
        ...(data.updated ? { updated: data.updated } : {}),
      })
    );

    yield delay(1000);
  } catch (error) {}
}

function* changeSearch({ search }: ReturnType<typeof flowChangeSearch>) {
  try {
    yield put(
      flowSetSearch({
        ...search,
        is_loading: !!search.text,
      })
    );

    if (!search.text) return;

    yield delay(500);

    const data: Unwrap<typeof getSearchResults> = yield call(getSearchResults, {
      text: search.text,
    });

    yield put(
      flowSetSearch({
        results: data.nodes,
        total: data.total,
      })
    );
  } catch (error) {
    yield put(flowSetSearch({ results: [], total: 0 }));
  } finally {
    yield put(flowSetSearch({ is_loading: false }));
  }
}

function* loadMoreSearch() {
  try {
    yield put(
      flowSetSearch({
        is_loading_more: true,
      })
    );

    const { search }: ReturnType<typeof selectFlow> = yield select(selectFlow);

    const { result, delay }: { result: Unwrap<typeof getSearchResults>; delay: any } = yield race({
      result: call(getSearchResults, {
        ...search,
        skip: search.results.length,
      }),
      delay: take(FLOW_ACTIONS.CHANGE_SEARCH),
    });

    if (delay) {
      return;
    }

    yield put(
      flowSetSearch({
        results: [...search.results, ...result.nodes],
        total: result.total,
      })
    );
  } catch (error) {
    yield put(
      flowSetSearch({
        is_loading_more: false,
      })
    );
  }
}

function* seenNode({ nodeId }: ReturnType<typeof labSeenNode>) {
  const { updated }: ReturnType<typeof selectFlow> = yield select(selectFlow);
  yield put(flowSetUpdated(updated.filter(node => node.id != nodeId)));
}

export default function* nodeSaga() {
  yield takeLatest([FLOW_ACTIONS.GET_FLOW, REHYDRATE], onGetFlow);
  yield takeLatest(FLOW_ACTIONS.SET_CELL_VIEW, onSetCellView);
  yield takeLeading(FLOW_ACTIONS.GET_MORE, getMore);
  yield takeLatest(FLOW_ACTIONS.CHANGE_SEARCH, changeSearch);
  yield takeLatest(FLOW_ACTIONS.LOAD_MORE_SEARCH, loadMoreSearch);
  yield takeLatest(FLOW_ACTIONS.SEEN_NODE, seenNode);
}
