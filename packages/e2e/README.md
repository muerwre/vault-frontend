# @vault/e2e

Drives the **real frontend against the real backend**. The backend's own specs
prove it answers correctly; these prove the app can actually consume what it
answers — a wire change the backend considers valid still fails here if a page
cannot render it.

## Running

Three processes: the database, the backend, the frontend.

```sh
# 1. seeded database
yarn db:up

# 2. backend
yarn workspace @vault/backend build
cd packages/backend && PORT=7777 node dist/main.js

# 3. frontend, pointed at that backend rather than production
cd packages/frontend
NEXT_PUBLIC_API_HOST=http://localhost:7777/api/ \
NEXT_PUBLIC_REMOTE_CURRENT=http://localhost:7777/api/static/ \
npx next dev -p 3010

# 4. the suite
cd packages/e2e
E2E_BASE_URL=http://localhost:3010 \
E2E_API_URL=http://localhost:7777/api \
E2E_JWT_SECRET=<the backend's JWT_SECRET> \
yarn test
```

`packages/frontend/.env.local` normally points at production. Pass the two
`NEXT_PUBLIC_*` values on the command line as above — a shell variable wins over
the file, so nothing needs editing.

## Environment

| Variable | Purpose |
|---|---|
| `E2E_BASE_URL` | Where the frontend is listening. Default `http://localhost:3000` |
| `E2E_API_URL` | Where the backend is listening. Default `http://localhost:7777/api` |
| `E2E_JWT_SECRET` | The backend's `JWT_SECRET`. Without it the authenticated specs **skip** rather than fail |
| `E2E_FRONTEND_API_HOST` | Only if the frontend was pointed somewhere other than `E2E_API_URL` — the app keys its stored session on this exact string |

## Notes

- Fixtures are **discovered from the running backend**, not hardcoded, so the
  suite works against any seeded database.
- Authenticated specs mint a token directly instead of typing into the login
  form, so no account with a known password is needed.
- **A 404 for an upload is not a failure.** A development database carries the
  file rows without the blobs, so images legitimately miss; only a 5xx or a page
  script error fails a test.
- Browsers are not vendored: run `npx playwright install chromium` once.
