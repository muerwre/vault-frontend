import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * The Next server that renders every page. The backend owns the only public
 * port: `/api` is Nest, and everything else is forwarded here, so the app and
 * the api share one origin.
 *
 * In development this defaults to the frontend's dev server, whose port is set
 * in its `dev` script — Next reads its port only from the command line. In
 * production it must be set, typically to the frontend container; without it
 * the backend answers `/api` alone.
 */
export const getFrontendUrl = (): string =>
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');

/**
 * Forwards page requests to the frontend. Only `GET`/`HEAD` outside `/api` are
 * forwarded; everything else reaches Nest, which answers its own 404. `ws`
 * carries the dev server's hot-reload socket.
 */
export const createFrontendProxy = (target: string) =>
  createProxyMiddleware({
    target,
    pathFilter: (path, req) =>
      !/^\/api(\/|$)/.test(path) &&
      (req.method === 'GET' || req.method === 'HEAD'),
    ws: true,
    changeOrigin: true,
  });
