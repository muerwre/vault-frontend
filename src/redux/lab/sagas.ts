import { takeLeading, call, put } from 'redux-saga/effects';
import { labGetList, labSetList } from '~/redux/lab/actions';
import { LAB_ACTIONS } from '~/redux/lab/constants';
import { Unwrap } from '~/redux/types';
import { getLabNodes } from '~/redux/lab/api';

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

export default function* labSaga() {
  yield takeLeading(LAB_ACTIONS.GET_LIST, getList);
}
