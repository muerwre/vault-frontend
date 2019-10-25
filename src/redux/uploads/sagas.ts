import { takeEvery, all, spawn, call, put, take, fork, race } from 'redux-saga/effects';
import { postUploadFile } from './api';
import { UPLOAD_ACTIONS, FILE_MIMES } from '~/redux/uploads/constants';
import {
  uploadUploadFiles,
  uploadSetStatus,
  uploadAddStatus,
  uploadDropStatus,
  uploadAddFile,
} from './actions';
import { reqWrapper } from '../auth/sagas';
import { createUploader, uploadGetThumb } from '~/utils/uploader';
import { HTTP_RESPONSES } from '~/utils/api';
import { IFileWithUUID, IFile, IUploadProgressHandler } from '../types';

function* uploadCall({
  file,
  temp_id,
  target,
  type,
  onProgress,
}: IFileWithUUID & { onProgress: IUploadProgressHandler }) {
  return yield call(reqWrapper, postUploadFile, {
    file,
    temp_id,
    type,
    target,
    onProgress,
  });
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

function* uploadWorker({ file, temp_id, target, type }: IFileWithUUID) {
  const [promise, chan] = createUploader<Partial<IFileWithUUID>, Partial<IFileWithUUID>>(
    uploadCall,
    { temp_id, target, type }
  );

  yield fork(onUploadProgress, chan);

  const result = yield call(promise, {
    temp_id,
    file,
    target,
    type,
  });

  return result;
}

function* uploadFile({ file, temp_id, type, target }: IFileWithUUID) {
  if (!file.type || !file.type || !FILE_MIMES[type].includes(file.type)) {
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
        // type: file.type,
        temp_id,
        type,
        name: file.name,
      }
    )
  );

  const { result, cancel, cancel_editing } = yield race({
    result: call(uploadWorker, {
      file,
      temp_id,
      target,
      type,
    }),
    cancel: call(uploadCancelWorker, temp_id),
    // subject_cancel: call(uploadSubjectCancelWorker, subject)
    // add here CANCEL_UPLOADS worker, that will watch for subject
    // cancel_editing: take(UPLOAD_ACTIONS.CANCEL_EDITING),
    // save_inventory: take(INVENTORY_ACTIONS.SAVE_INVENTORY),
  });

  if (cancel || cancel_editing) {
    return yield put(uploadDropStatus(temp_id));
  }

  const { data, error }: { data: IFile & { detail: string }; error: string } = result;

  if (error) {
    return yield put(
      uploadSetStatus(temp_id, { is_uploading: false, error: data.detail || error, type })
    );
  }

  yield put(
    uploadSetStatus(temp_id, {
      is_uploading: false,
      error: null,
      uuid: data.id,
      url: data.full_path,
      type,
      thumbnail_url: data.full_path,
      progress: 1,
      name: file.name,
    })
  );

  yield put(uploadAddFile(data));

  return { error: null, status: HTTP_RESPONSES.CREATED, data: {} }; // add file here as data
}

function* uploadFiles({ files }: ReturnType<typeof uploadUploadFiles>) {
  yield all(files.map(file => spawn(uploadFile, file)));
}

export default function*() {
  yield takeEvery(UPLOAD_ACTIONS.UPLOAD_FILES, uploadFiles);
}
