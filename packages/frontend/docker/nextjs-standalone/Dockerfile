# As written here: 
# https://dev.to/leduc1901/reduce-docker-image-size-for-your-nextjs-app-5911

# Base ───────────────────────────────────────────────────────────────────────
FROM node:14-alpine as base

WORKDIR /opt/app

ENV PATH /opt/app/node_modules/.bin:$PATH

# Build ──────────────────────────────────────────────────────────────────────
FROM base as builder

# Where people open the site. next.config.js derives the api, uploads and public
# addresses from it; they are inlined into the bundle, so this is a build arg.
# The persisted login is keyed on the derived api address, so changing it signs
# everybody out.
ARG PUBLIC_URL
# The Telegram bot; must be the one whose token the backend holds. Empty hides
# Telegram login and the contact link.
ARG TELEGRAM_BOT_USERNAME

ENV PUBLIC_URL $PUBLIC_URL
ENV TELEGRAM_BOT_USERNAME $TELEGRAM_BOT_USERNAME

COPY package.json .
COPY yarn.lock .

RUN true  \
  && yarn install --frozen-lockfile\
  && true

COPY . /opt/app

# pkg packs nodejs with given script, so we don't need it in next section
RUN yarn next build

FROM node:14-alpine as runner

WORKDIR /opt/app

COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/.next/standalone .
COPY --from=builder /opt/app/.next/static ./.next/static

EXPOSE 3000

ENTRYPOINT ["node", "server.js"]