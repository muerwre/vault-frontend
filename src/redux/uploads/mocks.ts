import { IResultWithStatus, IFile, UUID } from "../types";
import { HTTP_RESPONSES } from "~/utils/api";
import { EMPTY_FILE } from "./constants";
import uuid from 'uuid4';

export const uploadMock = ({ temp_id, file }: { temp_id: UUID, file: File }): Promise<IResultWithStatus<IFile>> => (
  Promise.resolve({
    status: HTTP_RESPONSES.CREATED,
    data: {
      ...EMPTY_FILE,
      id: uuid(),
      temp_id,
    },
    error: null,
  }));