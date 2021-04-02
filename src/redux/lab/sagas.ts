import { takeLeading, call, put, select } from 'redux-saga/effects';
import {
  labGetList,
  labSetList,
  labSetStats,
  labSetUpdates,
  labSeenNode,
} from '~/redux/lab/actions';
import { LAB_ACTIONS } from '~/redux/lab/constants';
import { Unwrap } from '~/redux/types';
import { getLabNodes, getLabStats, getLabUpdates } from '~/redux/lab/api';
import { selectLabUpdatesNodes } from '~/redux/lab/selectors';

function* getList({ after = '' }: ReturnType<typeof labGetList>) {
  try {
    yield put(labSetList({ is_loading: true }));
    const { nodes, count }: Unwrap<typeof getLabNodes> = yield call(getLabNodes, { after });
    yield put(labSetList({ nodes, count }));
  } catch (error) {
    yield put(labSetList({ error: error.message }));
  } finally {
    yield put(labSetList({ is_loading: false }));
  }
}

function* getStats() {
  try {
    yield put(labSetStats({ is_loading: true }));
    const { heroes, tags }: Unwrap<typeof getLabStats> = yield call(getLabStats);
    yield put(labSetStats({ heroes, tags }));
  } catch (error) {
    yield put(labSetStats({ error: error.message }));
  } finally {
    yield put(labSetStats({ is_loading: false }));
  }
}

function* getUpdates() {
  try {
    yield put(labSetUpdates({ isLoading: true }));
    const { nodes }: Unwrap<typeof getLabUpdates> = yield call(getLabUpdates);
    yield put(labSetUpdates({ nodes }));
  } catch (error) {
    console.log(error.message);
  } finally {
    yield put(labSetUpdates({ isLoading: false }));
  }
}

function* seenNode({ nodeId }: ReturnType<typeof labSeenNode>) {
  const nodes: ReturnType<typeof selectLabUpdatesNodes> = yield select(selectLabUpdatesNodes);
  const newNodes = nodes.filter(node => node.id != nodeId);
  yield put(labSetUpdates({ nodes: newNodes }));
}

export default function* labSaga() {
  yield takeLeading(LAB_ACTIONS.GET_LIST, getList);
  yield takeLeading(LAB_ACTIONS.GET_STATS, getStats);

  yield takeLeading(LAB_ACTIONS.GET_UPDATES, getUpdates);
  yield takeLeading(LAB_ACTIONS.SEEN_NODE, seenNode);
}
