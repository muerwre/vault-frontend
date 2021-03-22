import { takeLeading, call, put } from 'redux-saga/effects';
import { labGetList, labSetList, labSetStats } from '~/redux/lab/actions';
import { LAB_ACTIONS } from '~/redux/lab/constants';
import { Unwrap } from '~/redux/types';
import { getLabNodes, getLabStats } from '~/redux/lab/api';

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

export default function* labSaga() {
  yield takeLeading(LAB_ACTIONS.GET_LIST, getList);
  yield takeLeading(LAB_ACTIONS.GET_STATS, getStats);
}
