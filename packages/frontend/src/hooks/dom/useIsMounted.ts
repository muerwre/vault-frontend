import { useEffect, useState } from 'react';

/**
 * False on the server and on the first client render, true afterwards. Lets a
 * component branch on client-only state (the stored login) without the first
 * client render disagreeing with the server HTML it hydrates.
 */
export const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  return isMounted;
};
