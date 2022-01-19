import { useRouter } from 'next/router';
import { useRouteMatch } from 'react-router';

import { CONFIG } from '~/utils/config';

export const useNodePageParams = () => {
  return CONFIG.isNextEnvironment
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      (useRouter().query.id as string)
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useRouteMatch<{ id: string }>().params.id;
};
