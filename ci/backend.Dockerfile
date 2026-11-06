# Build context is the repo root: the backend imports `@vault/common`, which is
# a sibling workspace and has to be built alongside it.
#
# Not bundled: TypeORM finds migrations by globbing the filesystem, which does
# not survive being flattened into a single file. A plain install is larger but
# behaves like development.
#
# Needs Node >= 22.12. The build targets CommonJS, and two dependencies (audio
# metadata, the VK client) ship only as ES modules; `require()` can load those
# only from 22.12 on, and on anything older the app fails at startup. The runner
# asserts the version so a bad base image fails the build.

ARG NODE_IMAGE=node:22-slim

FROM ${NODE_IMAGE} AS builder

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

# Drop dev dependencies from the tree the runner copies. The mkdir keeps the
# runner's COPY of the backend's own node_modules valid if nothing is nested.
RUN yarn install --frozen-lockfile --production --ignore-scripts \
  && yarn cache clean \
  && mkdir -p packages/backend/node_modules

FROM ${NODE_IMAGE} AS runner

RUN node -e "const [major, minor] = process.versions.node.split('.').map(Number); \
  if (major < 22 || (major === 22 && minor < 12)) { \
    console.error('Node >= 22.12 is required, found ' + process.versions.node); \
    process.exit(1); \
  }"

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
# Where the backend's version of a package differs from the one hoisted to the
# root (the frontend's), yarn nests it here. Leaving this out makes the backend
# silently resolve the frontend's copy — e.g. an older sharp that ignores
# `autoOrient`, so camera photos come out sideways in every scaled size.
COPY --from=builder /app/packages/backend/node_modules ./packages/backend/node_modules

# Uploads live outside the image; mount a volume here and point UPLOADS_PATH at
# it, or every uploaded file is lost on redeploy.
RUN mkdir -p /var/lib/vault/uploads

WORKDIR /app/packages/backend

EXPOSE 8000

# Configuration comes from the environment. A `.env` file is read when present,
# but nothing requires one — compose or the orchestrator can supply the values
# directly.
CMD ["node", "dist/main.js"]
