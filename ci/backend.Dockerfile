# Build context is the repo root: the backend imports `@vault/common`, which is
# a sibling workspace and has to be built alongside it.
#
# Deliberately *not* bundled with ncc. The backend loads two ESM-only libraries
# through dynamic `import()` (audio metadata and the VK client), and TypeORM
# finds migrations by globbing the filesystem — neither survives being flattened
# into a single file. A plain install is larger but behaves like development.

FROM node:22-slim AS builder

WORKDIR /app

# Manifests first, so a source-only change reuses the cached install layer.
COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/common/package.json ./packages/common/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/e2e/package.json ./packages/e2e/
COPY packages/migration/package.json ./packages/migration/

# Installs every workspace, including the frontend's: yarn 1 has no way to
# install a subset, and a partial tree breaks the workspace symlinks.
RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY packages/common ./packages/common
COPY packages/backend ./packages/backend

RUN yarn workspace @vault/common build \
  && yarn workspace @vault/backend build

# Drop dev dependencies from the tree the runner copies.
RUN yarn install --frozen-lockfile --production --ignore-scripts \
  && yarn cache clean

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# `@vault/common` is a symlink into packages/, so the tree and the link target
# have to be copied together for it to resolve.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/common/package.json ./packages/common/
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Uploads live outside the image; mount a volume here and point UPLOADS_PATH at
# it, or every uploaded file is lost on redeploy.
RUN mkdir -p /var/lib/vault/uploads

WORKDIR /app/packages/backend

EXPOSE 8000

# Configuration comes from the environment. A `.env` file is read when present,
# but nothing requires one — compose or the orchestrator can supply the values
# directly.
CMD ["node", "dist/main.js"]
