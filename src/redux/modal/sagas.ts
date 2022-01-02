import { put, takeEvery } from 'redux-saga/effects';
import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router';
import { authOpenProfile, authShowRestoreModal } from '../auth/actions';
import { DIALOGS, MODAL_ACTIONS } from './constants';
import { modalSet, modalShowPhotoswipe } from './actions';

function* onPathChange({
  payload: {
    location: { pathname },
  },
}: LocationChangeAction) {
  if (pathname.match(/^\/~([\wа-яА-Я]+)/)) {
    const match = pathname.match(/^\/~([\wа-яА-Я]+)/);

    if (!match || !match.length || !match[1]) {
      return;
    }

    return yield put(authOpenProfile(match[1]));
  }

  if (pathname.match(/^\/restore\/([\w\-]+)/)) {
    const match = pathname.match(/^\/restore\/([\w\-]+)/);

    if (!match || !match.length || !match[1]) {
      return;
    }

    return yield put(authShowRestoreModal(match[1]));
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
