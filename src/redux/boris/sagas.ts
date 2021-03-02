import { takeLatest, put, call } from 'redux-saga/effects';
import { BORIS_ACTIONS } from './constants';
import { borisSetStats } from './actions';
import { getBorisGitStats, getBorisBackendStats } from './api';
import { Unwrap } from '../types';

function* loadStats() {
  try {
    yield put(borisSetStats({ is_loading: true }));

    const git: Unwrap<typeof getBorisGitStats> = yield call(getBorisGitStats);
    const backend: Unwrap<typeof getBorisBackendStats> = yield call(getBorisBackendStats);

    yield put(borisSetStats({ git, backend }));
  } catch (e) {
    yield put(borisSetStats({ git: [], backend: undefined }));
  } finally {
    yield put(borisSetStats({ is_loading: false }));
  }
}

export default function* borisSaga() {
  yield takeLatest(BORIS_ACTIONS.LOAD_STATS, loadStats);
}
