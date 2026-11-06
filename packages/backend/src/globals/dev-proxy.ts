import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * Where the frontend's dev server listens. Must match the port in the
 * frontend's `dev` script — Next takes its port only from the command line, not
 * from an env file. Overridable for a frontend started elsewhere.
 */
export const FRONTEND_DEV_URL =
  process.env.FRONTEND_DEV_URL || 'http://localhost:3001';

/**
 * Development only: hands every page request to the frontend's dev server, so
 * the app and the api share one origin, as they do in production.
 *
 * Only `GET`/`HEAD` outside `/api` are forwarded; everything else reaches Nest,
 * which answers its own 404. `ws` carries the dev server's hot-reload socket.
 */
export const DEV_PASSTHROUGH_MIDDLEWARE = createProxyMiddleware({
  target: FRONTEND_DEV_URL,
  pathFilter: (path, req) =>
    !/^\/api(\/|$)/.test(path) &&
    (req.method === 'GET' || req.method === 'HEAD'),
  ws: true,
  changeOrigin: true,
});
