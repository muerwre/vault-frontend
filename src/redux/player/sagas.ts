import { call, delay, fork, put, race, select, take, takeLatest } from 'redux-saga/effects';
import { PLAYER_ACTIONS, PlayerState } from './constants';
import {
  playerGetYoutubeInfo,
  playerSeek,
  playerSet,
  playerSetFile,
  playerSetStatus,
} from './actions';
import { Player } from '~/utils/player';
import { getURL } from '~/utils/dom';
import { Unwrap } from '../types';
import { apiGetEmbedYoutube } from './api';
import { selectPlayer } from './selectors';

function* setFileAndPlaySaga({ file }: ReturnType<typeof playerSetFile>) {
  if (!file) {
    return;
  }

  yield put(playerSetFile(file));

  Player.set(getURL(file));
  Player.play();
}

function playSaga() {
  Player.play();
}

function pauseSaga() {
  Player.pause();
}

function stopSaga() {
  Player.stop();
}

function seekSaga({ seek }: ReturnType<typeof playerSeek>) {
  Player.jumpToPercent(seek * 100);
}

function* stoppedSaga() {
  yield put(playerSetStatus(PlayerState.UNSET));
  yield put(playerSetFile(undefined));
}

function* getYoutubeInfo() {
  let ids: string[] = [];

  while (true) {
    const {
      action,
      ticker,
    }: { action: ReturnType<typeof playerGetYoutubeInfo>; ticker: any } = yield race({
      action: take(PLAYER_ACTIONS.GET_YOUTUBE_INFO),
      ...(ids.length > 0 ? { ticker: delay(500) } : {}),
    });

    if (action) {
      ids.push(action.url);
    }

    if (!ticker && ids.length <= 25) {
      // Try to collect more items in next 500ms
      continue;
    }

    try {
      const data: Unwrap<typeof apiGetEmbedYoutube> = yield call(apiGetEmbedYoutube, ids);

      if (data.items && Object.keys(data.items).length) {
        const { youtubes }: ReturnType<typeof selectPlayer> = yield select(selectPlayer);
        yield put(playerSet({ youtubes: { ...youtubes, ...data.items } }));
      }

      ids = [];
    } catch {}
  }
}

export default function* playerSaga() {
  yield fork(getYoutubeInfo);

  yield takeLatest(PLAYER_ACTIONS.SET_FILE_AND_PLAY, setFileAndPlaySaga);
  yield takeLatest(PLAYER_ACTIONS.PAUSE, pauseSaga);
  yield takeLatest(PLAYER_ACTIONS.PLAY, playSaga);
  yield takeLatest(PLAYER_ACTIONS.SEEK, seekSaga);
  yield takeLatest(PLAYER_ACTIONS.STOP, stopSaga);
  yield takeLatest(PLAYER_ACTIONS.STOPPED, stoppedSaga);
}
