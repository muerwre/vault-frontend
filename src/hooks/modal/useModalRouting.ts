import { useCallback, useMemo } from 'react';

import { useRouter } from 'next/router';

/** use this to preserve scrolling and handle back button behaviour on
 * opening modal
 *
 * this will replace url with ?modal=modalName, next you should
 * show modal for that name and pass params to it
 */
export const useModalRouting = () => {
  const router = useRouter();

  const openModal = useCallback(
    (modalName: string) => {
      const [path] = router.asPath.split('?');

      void router.push(path + '?modal=' + modalName, path + '?modal=' + modalName, {
        shallow: true,
        scroll: false,
      });
    },
    [router]
  );

  const currentModal = useMemo(() => router.query.modal, [router]);

  console.log(currentModal);

  return { openModal };
};
