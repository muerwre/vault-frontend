import { takeLatest, put } from 'redux-saga/effects';
import { PLAYER_ACTIONS, PLAYER_STATES } from './constants';
import { playerSetFile, playerSeek, playerSetStatus } from './actions';
import { Player } from '~/utils/player';
import { getURL } from '~/utils/dom';

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

export default function* playerSaga() {
  yield takeLatest(PLAYER_ACTIONS.SET_FILE_AND_PLAY, setFileAndPlaySaga);
  yield takeLatest(PLAYER_ACTIONS.PAUSE, pauseSaga);
  yield takeLatest(PLAYER_ACTIONS.PLAY, playSaga);
  yield takeLatest(PLAYER_ACTIONS.SEEK, seekSaga);
  yield takeLatest(PLAYER_ACTIONS.STOP, stopSaga);
  yield takeLatest(PLAYER_ACTIONS.STOPPED, stoppedSaga);
}
