import { makeAutoObservable, runInAction } from 'mobx';

import { ERROR_LITERAL, ERRORS } from '~/constants/errors';
import { UploadType } from '~/constants/uploads';
import { IFile, UUID } from '~/types';
import { has, omit, values } from '~/utils/ramda';
import { getFileType, uploadGetThumb } from '~/utils/uploader';

export interface UploadStatus {
  id: UUID;
  thumbnail: string;
  size: number;
  name: string;
  progress: number;
  type: UploadType;
}

export class UploaderStore {
  pending: Record<UUID, UploadStatus> = {};

  constructor(public files: IFile[] = []) {
    makeAutoObservable(this);
  }

  addFile = (file: IFile) => this.files.push(file);

  // replaces all files
  setFiles = (files: IFile[]) => {
    this.files = files;
  };

  // refreshes only images, keeping audios as they was
  setImages = (newImages: IFile[]) => {
    this.files = [...newImages, ...this.filesAudios];
  };

  // refreshes only audios, keeping audios as they was
  setAudios = (newAudios: IFile[]) => {
    this.files = [...newAudios, ...this.filesImages];
  };

  /** adds pending from file */
  addPending = async (id: string, file: File) => {
    const thumbnail = await uploadGetThumb(file);
    const size = file.size;
    const name = file.name;
    const progress = 0;
    const type = getFileType(file);

    if (!type) {
      throw new Error(ERROR_LITERAL[ERRORS.UNKNOWN_FILE_TYPE]);
    }

    runInAction(() => {
      this.pending[id] = { id, thumbnail, size, name, progress, type };
    });

    return this.pending[id];
  };

  /** updates progress for file */
  updateProgress = (id: UUID, loaded: number, total: number) => {
    if (!has(id, this.pending)) {
      return;
    }

    this.pending[id].progress = loaded / total;
  };

  /** removes pending item by id */
  removePending = (id: UUID) => {
    this.pending = omit([id], this.pending);
  };

  /** returns only image files */
  get filesImages() {
    return this.files.filter((file) => file && file.type === UploadType.Image);
  }

  /** returns only image pending */
  get pendingImages() {
    return values(this.pending).filter(
      (item) => item.type === UploadType.Image,
    );
  }

  /** returns only audio files */
  get filesAudios() {
    return this.files.filter((file) => file && file.type === UploadType.Audio);
  }

  /** returns only audio pending */
  get pendingAudios() {
    return values(this.pending).filter(
      (item) => item.type === UploadType.Audio,
    );
  }
}
