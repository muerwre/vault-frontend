# @vault/e2e

Drives the **real frontend against the real backend**. The backend's own specs
prove it answers correctly; these prove the app can actually consume what it
answers — a wire change the backend considers valid still fails here if a page
cannot render it.

## Running

Start the app as usual, then point the suite at its one public address — the
backend, which proxies pages to the frontend:

```sh
yarn db:up        # seeded database
yarn dev          # backend on PORT (3000), proxying pages to next dev

cd packages/e2e
E2E_BASE_URL=http://localhost:3000 \
E2E_JWT_SECRET=<the backend's JWT_SECRET> \
yarn test
```

`E2E_BASE_URL` must be the same address the app was configured with
(`PUBLIC_URL`, or `http://localhost:$PORT` when unset): the app keys its stored
login on the api address derived from it.

## CI

The `e2e` job in `.forgejo/workflows/build.yml` runs against an **empty**
MariaDB: the baseline migration builds the schema and `fixtures/seed.sql` adds a
handful of synthetic users and posts. The production dump never reaches CI — it
holds real accounts.

With `CI` set, `playwright.config.ts` starts the backend (`dist/main.js`) on
`E2E_BASE_URL`'s port and the frontend (`next dev`) behind it, both given that
address as `PUBLIC_URL`. To reproduce a CI run locally against a scratch
database:

```sh
docker run -d --rm --name vault-e2e-db -e MARIADB_ROOT_PASSWORD=password \
  -e MARIADB_DATABASE=adonis -p 3399:3306 mariadb:10.8
export DB_HOST=127.0.0.1 DB_PORT=3399
yarn workspace @vault/e2e db:wait
yarn backend:migration:run
yarn workspace @vault/e2e db:seed        # refuses a non-empty database
yarn common:build && yarn backend:build

CI=true JWT_SECRET=s E2E_JWT_SECRET=s UPLOADS_PATH=/tmp/uploads \
E2E_BASE_URL=http://localhost:3010 \
yarn e2e:test
```

Flow posts in the seed are backdated past 30 days: the flow's `after` page holds
what precedes the default window, so a post created today would not appear in it.

## Environment

| Variable | Purpose |
|---|---|
| `E2E_BASE_URL` | The app's public address — the backend. Default `http://localhost:3000`. The api is `<E2E_BASE_URL>/api` |
| `E2E_JWT_SECRET` | The backend's `JWT_SECRET`. Without it the authenticated specs **skip** rather than fail |
| `E2E_FRONTEND_PORT` | CI only: the port `next dev` gets behind the backend. Default `3011` |

## Notes

- Fixtures are **discovered from the running backend**, not hardcoded, so the
  suite works against any seeded database.
- Authenticated specs mint a token directly instead of typing into the login
  form, so no account with a known password is needed.
- **A 404 for an upload is not a failure.** A development database carries the
  file rows without the blobs, so images legitimately miss; only a 5xx or a page
  script error fails a test.
- Browsers are not vendored: run `npx playwright install chromium` once.
