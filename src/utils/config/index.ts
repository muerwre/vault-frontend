export const CONFIG = {
  apiHost: process.env.REACT_APP_API_HOST || process.env.NEXT_PUBLIC_API_HOST || '',
  remoteCurrent:
    process.env.REACT_APP_REMOTE_CURRENT || process.env.NEXT_PUBLIC_REMOTE_CURRENT || '',
  // transitional prop, marks migration to nextjs
  isNextEnvironment: !!process.env.NEXT_PUBLIC_REMOTE_CURRENT || typeof window === 'undefined',
};
