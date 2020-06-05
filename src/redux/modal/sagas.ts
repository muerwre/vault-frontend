import { takeEvery, put } from 'redux-saga/effects';
import { LocationChangeAction, LOCATION_CHANGE } from 'connected-react-router';
import { authOpenProfile, authShowRestoreModal } from '../auth/actions';
import { MODAL_ACTIONS, DIALOGS } from './constants';
import { modalShowPhotoswipe, modalSet } from './actions';

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

function* onShowPhotoswipe({ images, index }: ReturnType<typeof modalShowPhotoswipe>) {
  yield put(
    modalSet({
      dialog: DIALOGS.PHOTOSWIPE,
      is_shown: true,
      photoswipe: {
        images,
        index,
      },
    })
  );
}

export function* modalSaga() {
  yield takeEvery(LOCATION_CHANGE, onPathChange);
  yield takeEvery(MODAL_ACTIONS.SHOW_PHOTOSWIPE, onShowPhotoswipe);
}
