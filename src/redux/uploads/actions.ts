import {UPLOAD_ACTIONS} from "~/redux/uploads/constants";

export const uploadUploadFiles = (files: File[], subject: string) => ({
  files,
  subject,
  type: UPLOAD_ACTIONS.UPLOAD_FILES,
});
