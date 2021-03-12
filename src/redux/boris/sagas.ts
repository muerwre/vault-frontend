import { call, put, takeLatest } from 'redux-saga/effects';
import { BORIS_ACTIONS } from './constants';
import { borisSetStats } from './actions';
import { getBorisBackendStats, getGithubIssues } from './api';
import { Unwrap } from '../types';

function* loadStats() {
  try {
    yield put(borisSetStats({ is_loading: true }));

    const backend: Unwrap<typeof getBorisBackendStats> = yield call(getBorisBackendStats);
    const issues: Unwrap<typeof getGithubIssues> = yield call(getGithubIssues);

    yield put(borisSetStats({ issues, backend }));
  } catch (e) {
    yield put(borisSetStats({ git: [], backend: undefined }));
  } finally {
    yield put(borisSetStats({ is_loading: false }));
  }
}

export default function* borisSaga() {
  yield takeLatest(BORIS_ACTIONS.LOAD_STATS, loadStats);
}
