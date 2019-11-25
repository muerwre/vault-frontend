import { takeEvery, put } from 'redux-saga/effects';
import { LocationChangeAction, LOCATION_CHANGE } from 'connected-react-router';
import { authOpenProfile, authShowRestoreModal } from '../auth/actions';

function* onPathChange({
  payload: {
    location: { pathname },
  },
}: LocationChangeAction) {
  if (pathname.match(/^\/~([\wа-яА-Я]+)/)) {
    const [, username] = pathname.match(/^\/~([\wа-яА-Я]+)/);
    return yield put(authOpenProfile(username));
  }

  if (pathname.match(/^\/restore\/([\w\-]+)/)) {
    const [, code] = pathname.match(/^\/restore\/([\w\-]+)/);
    return yield put(authShowRestoreModal(code));
  }
}

export function* modalSaga() {
  yield takeEvery(LOCATION_CHANGE, onPathChange);
}
