import { useRouteMatch } from 'react-router';
import { useRouter } from 'next/router';
import { CONFIG } from '~/utils/config';

export const useNodePageParams = () => {
  return CONFIG.isNextEnvironment
    ? (useRouter().query.id as string)
    : useRouteMatch<{ id: string }>().params.id;
};
