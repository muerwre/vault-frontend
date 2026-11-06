# Build context is the repo root: the frontend is a workspace of the monorepo,
# whose lockfile and hoisted dependencies live there.

ARG NODE_IMAGE=node:22-slim

FROM ${NODE_IMAGE} AS builder

WORKDIR /app

# Where people open the site. next.config.js derives the api, uploads and public
# addresses from it; they are inlined into the bundle, so this is a build arg.
# The persisted login is keyed on the derived api address, so changing it signs
# everybody out.
ARG PUBLIC_URL
# The Telegram bot; must be the one whose token the backend holds. Empty hides
# Telegram login and the contact link.
ARG TELEGRAM_BOT_USERNAME

ENV PUBLIC_URL=$PUBLIC_URL
ENV TELEGRAM_BOT_USERNAME=$TELEGRAM_BOT_USERNAME
ENV NEXT_TELEMETRY_DISABLED=1

# Manifests first, so a source-only change reuses the cached install layer.
COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/common/package.json ./packages/common/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/e2e/package.json ./packages/e2e/
COPY packages/migration/package.json ./packages/migration/

# Installs every workspace: yarn 1 has no way to install a subset, and a partial
# tree breaks the workspace symlinks.
RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY packages/frontend ./packages/frontend

RUN yarn workspace @vault/frontend next:build

FROM ${NODE_IMAGE} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# The standalone output mirrors the monorepo layout from the tracing root:
# traced dependencies at the top, the server under packages/frontend. Static
# assets and public files are not part of it and are copied beside the server.
COPY --from=builder /app/packages/frontend/.next/standalone ./
COPY --from=builder /app/packages/frontend/.next/static ./packages/frontend/.next/static
COPY --from=builder /app/packages/frontend/public ./packages/frontend/public

EXPOSE 3000

CMD ["node", "packages/frontend/server.js"]
