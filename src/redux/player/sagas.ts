import { takeLatest, put, fork, race, take, delay, call, select } from 'redux-saga/effects';
import { PLAYER_ACTIONS, PLAYER_STATES } from './constants';
import {
  playerSetFile,
  playerSeek,
  playerSetStatus,
  playerGetYoutubeInfo,
  playerSet,
} from './actions';
import { Player } from '~/utils/player';
import { getURL } from '~/utils/dom';
import { Unwrap } from '../types';
import { getEmbedYoutube } from './api';
import { selectPlayer } from './selectors';

function* setFileAndPlaySaga({ file }: ReturnType<typeof playerSetFile>) {
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
  yield put(playerSetStatus(PLAYER_STATES.UNSET));
  yield put(playerSetFile(null));
}

function* getYoutubeInfo() {
  let ids: string[] = [];

  while (true) {
    const {
      action,
      ticker,
    }: { action: ReturnType<typeof playerGetYoutubeInfo>; ticker: any } = yield race({
      action: take(PLAYER_ACTIONS.GET_YOUTUBE_INFO),
      ...(ids.length > 0 ? { ticker: delay(1000) } : {}),
    });

    if (action) {
      ids.push(action.url);
    }

    if (ticker || ids.length > 25) {
      const result: Unwrap<ReturnType<typeof getEmbedYoutube>> = yield call(getEmbedYoutube, ids);

      if (!result.error && result.data.items && Object.keys(result.data.items).length) {
        const { youtubes }: ReturnType<typeof selectPlayer> = yield select(selectPlayer);
        yield put(playerSet({ youtubes: { ...youtubes, ...result.data.items } }));
      }

      ids = [];
    }
  }
}

export default function* playerSaga() {
  yield takeLatest(PLAYER_ACTIONS.SET_FILE_AND_PLAY, setFileAndPlaySaga);
  yield takeLatest(PLAYER_ACTIONS.PAUSE, pauseSaga);
  yield takeLatest(PLAYER_ACTIONS.PLAY, playSaga);
  yield takeLatest(PLAYER_ACTIONS.SEEK, seekSaga);
  yield takeLatest(PLAYER_ACTIONS.STOP, stopSaga);
  yield takeLatest(PLAYER_ACTIONS.STOPPED, stoppedSaga);

  yield fork(getYoutubeInfo);
  // yield takeEvery(PLAYER_ACTIONS.GET_YOUTUBE_INFO, getYoutubeInfo);
}
