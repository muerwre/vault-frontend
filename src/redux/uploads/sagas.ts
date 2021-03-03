import { SagaIterator } from 'redux-saga';
import { all, call, fork, put, race, spawn, take, takeEvery } from 'redux-saga/effects';
import { apiUploadFile } from './api';
import { FILE_MIMES, UPLOAD_ACTIONS } from '~/redux/uploads/constants';
import {
  uploadAddFile,
  uploadAddStatus,
  uploadDropStatus,
  uploadSetStatus,
  uploadUploadFiles,
} from './actions';
import { createUploader, uploadGetThumb } from '~/utils/uploader';
import { HTTP_RESPONSES } from '~/utils/api';
import { IFileWithUUID, IUploadProgressHandler, Unwrap } from '../types';

function* uploadCall({
  file,
  temp_id,
  target,
  type,
  onProgress,
}: IFileWithUUID & { onProgress: IUploadProgressHandler }) {
  const data: Unwrap<typeof apiUploadFile> = yield call(apiUploadFile, {
    file,
    temp_id,
    type,
    target,
    onProgress,
  });

  return data;
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

function* uploadWorker({
  file,
  temp_id,
  target,
  type,
}: IFileWithUUID): SagaIterator<Unwrap<typeof uploadCall>> {
  const [promise, chan] = createUploader<Partial<IFileWithUUID>, Partial<IFileWithUUID>>(
    uploadCall,
    { temp_id, target, type }
  );

  yield fork(onUploadProgress, chan);

  return yield call(promise, {
    temp_id,
    file,
    target,
    type,
  });
}

function* uploadFile({ file, temp_id, type, target, onSuccess, onFail }: IFileWithUUID) {
  if (!temp_id) return;

  try {
    if (!file.type || !FILE_MIMES[type] || !FILE_MIMES[type].includes(file.type)) {
      return {
        error: 'File_Not_Image',
        status: HTTP_RESPONSES.BAD_REQUEST,
        data: {},
      };
    }

    const preview: Unwrap<typeof uploadGetThumb> = yield call(uploadGetThumb, file);

    yield put(
      uploadAddStatus(temp_id, {
        preview: preview.toString(),
        is_uploading: true,
        temp_id,
        type,
        name: file.name,
      })
    );

    const [result, cancel]: [
      Unwrap<typeof uploadCall>,
      Unwrap<typeof uploadCancelWorker>
    ] = yield race([
      call(uploadWorker, {
        file,
        temp_id,
        target,
        type,
      }),
      call(uploadCancelWorker, temp_id),
    ]);

    if (cancel || !result) {
      if (onFail) onFail();
      return yield put(uploadDropStatus(temp_id));
    }

    yield put(
      uploadSetStatus(temp_id, {
        is_uploading: false,
        error: '',
        uuid: result.id,
        url: result.full_path,
        type,
        thumbnail_url: result.full_path,
        progress: 1,
        name: file.name,
      })
    );

    yield put(uploadAddFile(result));

    if (onSuccess) onSuccess(result);
  } catch (error) {
    if (onFail) onFail();

    return yield put(
      uploadSetStatus(temp_id, {
        is_uploading: false,
        error,
        type,
      })
    );
  }
}

function* uploadFiles({ files }: ReturnType<typeof uploadUploadFiles>) {
  yield all(files.map(file => spawn(uploadFile, file)));
}

export default function*() {
  yield takeEvery(UPLOAD_ACTIONS.UPLOAD_FILES, uploadFiles);
}
