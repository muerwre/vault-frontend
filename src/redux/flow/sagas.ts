import { call, delay, put, race, select, take, takeLatest } from 'redux-saga/effects';
import { FLOW_ACTIONS } from './constants';
import { flowChangeSearch, flowSetSearch } from './actions';
import { Unwrap } from '../types';
import { selectFlow } from './selectors';
import { getSearchResults } from './api';

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

export default function* nodeSaga() {
  yield takeLatest(FLOW_ACTIONS.CHANGE_SEARCH, changeSearch);
  yield takeLatest(FLOW_ACTIONS.LOAD_MORE_SEARCH, loadMoreSearch);
}
