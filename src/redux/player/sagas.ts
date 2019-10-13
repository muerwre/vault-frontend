import { takeLatest } from 'redux-saga/effects';
import { PLAYER_ACTIONS } from './constants';
import { playerSetFile, playerSeek } from './actions';
import { Player } from '~/utils/player';
import { getURL } from '~/utils/dom';

function setFileSaga({ file }: ReturnType<typeof playerSetFile>) {
  Player.set(getURL(file));
  Player.play();
}

function playSaga() {
  Player.play();
}

function pauseSaga() {
  Player.pause();
}

function seekSaga({ seek }: ReturnType<typeof playerSeek>) {
  Player.jumpToPercent(seek * 100);
  console.log(seek * 100);
}

export default function* playerSaga() {
  yield takeLatest(PLAYER_ACTIONS.SET_FILE, setFileSaga);
  yield takeLatest(PLAYER_ACTIONS.PAUSE, pauseSaga);
  yield takeLatest(PLAYER_ACTIONS.PLAY, playSaga);
  yield takeLatest(PLAYER_ACTIONS.SEEK, seekSaga);
}
