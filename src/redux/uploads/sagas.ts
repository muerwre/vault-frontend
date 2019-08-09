import { takeEvery, all, spawn, call, put, take, fork, race } from 'redux-saga/effects';
import { UPLOAD_ACTIONS } from '~/redux/uploads/constants';
import {
  uploadUploadFiles, uploadSetStatus, uploadAddStatus, uploadDropStatus, uploadAddFile
} from './actions';
import { reqWrapper } from '../auth/sagas';
import { createUploader, uploadGetThumb, fakeUploader } from '~/utils/uploader';
import { HTTP_RESPONSES } from '~/utils/api';
import { VALIDATORS } from '~/utils/validators';
import { UUID, IFileWithUUID, IFile } from '../types';

function* uploadCall({ temp_id, onProgress, file }) {
  return yield call(reqWrapper, fakeUploader, { file: { url: 'some', error: 'cant do this boss' }, onProgress, mustSucceed: true });
}

function* onUploadProgress(chan) {
  while (true) {
    const { progress, temp_id }: { progress: number; temp_id: string } = yield take(chan);

    yield put(uploadSetStatus(temp_id, { progress }));
  }
}

function* uploadCancelWorker(id) {
  while (true) {
    const { temp_id } = yield take(UPLOAD_ACTIONS.UPLOAD_CANCEL);
    if (temp_id === id) break;
  }

  return true;
}

function* uploadWorker(file: File, temp_id: UUID) {
  const [promise, chan] = createUploader<{ temp_id; file }, { temp_id }>(uploadCall, { temp_id });
  yield fork(onUploadProgress, chan);

  return yield call(promise, { temp_id, file });
}
function* uploadFile({ file, temp_id }: IFileWithUUID) {
  if (!file.type || !VALIDATORS.IS_IMAGE_MIME(file.type)) {
    return { error: 'File_Not_Image', status: HTTP_RESPONSES.BAD_REQUEST, data: {} };
  }

  const preview = yield call(uploadGetThumb, file);

  yield put(
    uploadAddStatus(
      // replace with the one, what adds file upload status
      temp_id,
      {
        preview,
        is_uploading: true,
        type: file.type,
        temp_id,
      }
    )
  );

  const {
    result, cancel, cancel_editing, save_inventory,
  } = yield race({
    result: call(uploadWorker, file, temp_id),
    cancel: call(uploadCancelWorker, temp_id),
    // subject_cancel: call(uploadSubjectCancelWorker, subject)
    // add here CANCEL_UPLOADS worker, that will watch for subject
    // cancel_editing: take(UPLOAD_ACTIONS.CANCEL_EDITING),
    // save_inventory: take(INVENTORY_ACTIONS.SAVE_INVENTORY),
  }) as any;

  if (cancel || cancel_editing || save_inventory) {
    return yield put(uploadDropStatus(temp_id));
  }

  const { data, error }: { data: IFile & { detail: any }; error: string } = result;

  if (error) {
    return yield put(
      uploadSetStatus(temp_id, { is_uploading: false, error: data.detail || error })
    );
  }

  console.log('upload', data);

  yield put(
    uploadSetStatus(temp_id, {
      is_uploading: false,
      error: null,
      uuid: data.id,
      url: data.full_path,
      thumbnail_url: data.full_path,
      progress: 1,
    })
  );

  yield put(uploadAddFile(data));

  return { error: null, status: HTTP_RESPONSES.CREATED, data: {} }; // add file here as data
}

function* uploadFiles({ files }: ReturnType<typeof uploadUploadFiles>) {
  yield all(files.map(file => spawn(uploadFile, file)));
}

export default function* () {
  yield takeEvery(UPLOAD_ACTIONS.UPLOAD_FILES, uploadFiles);
}
