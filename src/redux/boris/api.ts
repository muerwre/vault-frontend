import Axios from 'axios';
import { API } from '~/constants/api';
import { resultMiddleware, errorMiddleware } from '~/utils/api';

export const getBorisGitStats = (): Promise<any> =>
  Axios.get(API.BORIS.GET_GIT_LOG)
    .then(resultMiddleware)
    .catch(errorMiddleware);
