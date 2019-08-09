import { IState } from '~/redux/store';
import { IUploadState } from '~/redux/uploads/reducer';

export const selectUploads = ({ uploads }: IState): IUploadState => uploads;
export const selectUploadStatuses = ({ uploads: { statuses } }: IState): IUploadState['statuses'] => statuses;
