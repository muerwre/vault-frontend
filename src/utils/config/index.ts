export const CONFIG = {
  // https://vault48.org/ by default
  publicHost: process.env.NEXT_PUBLIC_PUBLIC_HOST,
  // backend endpoint
  apiHost: process.env.NEXT_PUBLIC_API_HOST || '',
  // image storage endpoint (sames as backend, but with /static usualy)
  remoteCurrent: process.env.NEXT_PUBLIC_REMOTE_CURRENT || '',
  // transitional prop, marks migration to nextjs
  isNextEnvironment:
    !!process.env.NEXT_PUBLIC_REMOTE_CURRENT || typeof window === 'undefined',
};
