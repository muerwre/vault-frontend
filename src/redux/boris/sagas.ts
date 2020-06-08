import { takeLatest, put } from 'redux-saga/effects';
import { BORIS_ACTIONS } from './constants';
import { borisSet } from './actions';

function* loadStats() {
  yield put(borisSet({ is_loading: true }));
  yield put(borisSet({ is_loading: false }));
}

export default function* borisSaga() {
  yield takeLatest(BORIS_ACTIONS.LOAD_STATS, loadStats);
}
