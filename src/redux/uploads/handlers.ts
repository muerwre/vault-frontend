import assocPath from 'ramda/es/assocPath';
import omit from 'ramda/es/omit';

import { UPLOAD_ACTIONS, EMPTY_UPLOAD_STATUS } from './constants';
import { uploadAddStatus, uploadDropStatus, uploadSetStatus } from './actions';
import { IUploadState } from './reducer';

const addStatus = (
  state: IUploadState,
  { temp_id, status }: ReturnType<typeof uploadAddStatus>
): IUploadState => assocPath(
  ['statuses'],
  { ...state.statuses, [temp_id]: { ...EMPTY_UPLOAD_STATUS, ...status } },
  state
);

const dropStatus = (
  state: IUploadState,
  { temp_id }: ReturnType<typeof uploadDropStatus>
): IUploadState => assocPath(
  ['statuses'],
  omit([temp_id], state.statuses),
  state,
);

const setStatus = (
  state: IUploadState,
  { temp_id, status }: ReturnType<typeof uploadSetStatus>
): IUploadState => assocPath(
  ['statuses'],
  { ...state.statuses, [temp_id]: { ...(state.statuses[temp_id] || EMPTY_UPLOAD_STATUS), ...status } },
  state
);
export const UPLOAD_HANDLERS = {
  [UPLOAD_ACTIONS.ADD_STATUS]: addStatus,
  [UPLOAD_ACTIONS.DROP_STATUS]: dropStatus,
  [UPLOAD_ACTIONS.SET_STATUS]: setStatus,
};
