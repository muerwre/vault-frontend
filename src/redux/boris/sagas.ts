import { takeLatest, put, call } from 'redux-saga/effects';
import { BORIS_ACTIONS } from './constants';
import { borisSet, borisSetStats } from './actions';
import { getBorisGitStats } from './api';

function* loadStats() {
  yield put(borisSetStats({ is_loading: true }));

  try {
    const git = yield getBorisGitStats();
    yield put(borisSetStats({ git, is_loading: false }));
  } catch (e) {
    yield put(borisSetStats({ git: [], is_loading: false }));
  }
}

export default function* borisSaga() {
  yield takeLatest(BORIS_ACTIONS.LOAD_STATS, loadStats);
}
