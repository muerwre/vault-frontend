import {takeEvery} from "redux-saga/effects";
import {UPLOAD_ACTIONS} from "~/redux/uploads/constants";

export default function* () {
  yield takeEvery(UPLOAD_ACTIONS.UPLOAD_FILES, console.log);
}
