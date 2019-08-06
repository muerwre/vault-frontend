import { createReducer } from "~/utils/reducer";
import { IFile } from "~/redux/types";
import { UUID } from "../types";
import { UPLOAD_HANDLERS } from "./handlers";

export interface IUploadStatus {
  progress: number; is_loading: boolean; error: string;
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