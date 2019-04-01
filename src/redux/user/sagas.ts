import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { USER_ACTIONS } from "$redux/user/constants";

// Worker Saga for SET_EDITOR_LOCATION_INPUT reducer
/*
function* fetchSuggestions({ payload }) {
  const { value } = payload;

  yield delay(300);
  try {
    const results = yield call(someFunction, arguments);
    yield put({ type: TYPES.ANOTHER_ACTION, payload: { results } });
  } catch (e) {
    yield put({ type: TYPES.ANOTHER_ACTION, payload: { results } });
  }
}
*/

function* mySaga() {
  // fetch autocompletion on location input
  //yield takeLatest(TYPES.ACTION, function);
}

export default mySaga;
