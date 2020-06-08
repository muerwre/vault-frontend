import { takeLatest, put, call } from 'redux-saga/effects';
import { BORIS_ACTIONS } from './constants';
import { borisSet } from './actions';
import { getBorisGitStats } from './api';

function* loadStats() {
  yield put(borisSet({ is_loading: true }));

  const result = yield getBorisGitStats();
  console.log(result);

  yield put(borisSet({ is_loading: false }));
}

export default function* borisSaga() {
  yield takeLatest(BORIS_ACTIONS.LOAD_STATS, loadStats);
}
