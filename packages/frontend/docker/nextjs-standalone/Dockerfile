# As written here: 
# https://dev.to/leduc1901/reduce-docker-image-size-for-your-nextjs-app-5911

# Base ───────────────────────────────────────────────────────────────────────
FROM node:14-alpine as base

WORKDIR /opt/app

ENV PATH /opt/app/node_modules/.bin:$PATH

# Build ──────────────────────────────────────────────────────────────────────
FROM base as builder

ARG NEXT_PUBLIC_API_HOST
ARG NEXT_PUBLIC_REMOTE_CURRENT
ARG NEXT_PUBLIC_PUBLIC_HOST
ARG NEXT_PUBLIC_BOT_USERNAME

ENV NEXT_PUBLIC_API_HOST $NEXT_PUBLIC_API_HOST
ENV NEXT_PUBLIC_REMOTE_CURRENT $NEXT_PUBLIC_REMOTE_CURRENT
ENV NEXT_PUBLIC_PUBLIC_HOST $NEXT_PUBLIC_PUBLIC_HOST
ENV NEXT_PUBLIC_BOT_USERNAME $NEXT_PUBLIC_BOT_USERNAME

# ENV NEXT_PUBLIC_API_HOST https://vault48.org/api/
# ENV NEXT_PUBLIC_REMOTE_CURRENT https://vault48.org/static/
# ENV NEXT_PUBLIC_PUBLIC_HOST https://vault48.org/
# ENV NEXT_PUBLIC_BOT_USERNAME vault48bot

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