import { IResultWithStatus, IFile } from "../types";
import { HTTP_RESPONSES } from "~/utils/api";

export const uploadMock = (file: File): Promise<IResultWithStatus<IFile>> => (
  Promise.resolve(() => ({
    status: HTTP_RESPONSES.CREATED,
    data: {
      ...EMPTY_FILE,
    },
    error: null,
  }))
);