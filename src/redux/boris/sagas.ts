import { takeLatest, put, call } from 'redux-saga/effects';
import { BORIS_ACTIONS } from './constants';
import { borisSetStats } from './actions';
import { getBorisGitStats, getBorisBackendStats } from './api';
import { Unwrap } from '../types';

function* loadStats() {
  yield put(borisSetStats({ is_loading: true }));

  try {
    const git: Unwrap<ReturnType<typeof getBorisGitStats>> = yield call(getBorisGitStats);
    const backend: Unwrap<ReturnType<typeof getBorisBackendStats>> = yield call(
      getBorisBackendStats
    );

    yield put(borisSetStats({ git, backend: backend.data, is_loading: false }));
  } catch (e) {
    yield put(borisSetStats({ git: [], backend: null, is_loading: false }));
  }
}

export default function* borisSaga() {
  yield takeLatest(BORIS_ACTIONS.LOAD_STATS, loadStats);
}
