import { createReducer } from "~/utils/reducer";
import { IFile } from "~/redux/types";
import { UUID } from "../types";
import { UPLOAD_HANDLERS } from "./handlers";

export interface IUploadStatus {
  is_uploading: boolean;
  error: string;
  preview: string;
  uuid: UUID;
  url: string;
  thumbnail_url: string;
  type: string;
  progress: number;
}

export interface IUploadState {
  files: Record<UUID, IFile>;
  statuses: Record<UUID, IUploadStatus>;
}

const INITIAL_STATE = {
  files: {},
  statuses: {},
};

export default createReducer(INITIAL_STATE, UPLOAD_HANDLERS);