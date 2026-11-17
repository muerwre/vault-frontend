# Build context is the repo root: the fetcher imports `@vault/common`, a
# sibling workspace. The result is one bundled file (ncc), so the runner needs
# no node_modules at all — only Node, ffmpeg and yt-dlp.

ARG NODE_IMAGE=node:22-bookworm-slim

FROM ${NODE_IMAGE} AS builder

WORKDIR /app

# Manifests first, so a source-only change reuses the cached install layer.
COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/common/package.json ./packages/common/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/e2e/package.json ./packages/e2e/
COPY packages/media-fetcher/package.json ./packages/media-fetcher/
COPY packages/migration/package.json ./packages/migration/

# Installs every workspace: yarn 1 has no way to install a subset, and a partial
# tree breaks the workspace symlinks.
RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY packages/common ./packages/common
COPY packages/media-fetcher ./packages/media-fetcher

RUN yarn workspace @vault/common build \
  && yarn workspace @vault/media-fetcher build

FROM ${NODE_IMAGE} AS runner

# Debian's ffmpeg has libx264 and AAC, which is all the fetcher asks of it.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# The newest stable yt-dlp at build time. A URL ADD is re-fetched and compared
# on every build, so a new release busts the cache. The standalone binary needs
# no Python.
ADD https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux /opt/yt-dlp/yt-dlp

# yt-dlp updates itself in place at runtime, so its directory belongs to the
# user the fetcher runs as. Jobs work in /work.
RUN chmod 755 /opt/yt-dlp/yt-dlp \
  && useradd --system --create-home fetcher \
  && mkdir -p /work \
  && chown -R fetcher /opt/yt-dlp /work

ENV PATH="/opt/yt-dlp:${PATH}" \
  NODE_ENV=production \
  WORK_DIR=/work

WORKDIR /app
COPY --from=builder /app/packages/media-fetcher/dist ./dist

USER fetcher

CMD ["node", "--enable-source-maps", "dist/index.js"]
