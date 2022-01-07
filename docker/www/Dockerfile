FROM node:14-alpine as builder
COPY package.json yarn.lock ./
RUN yarn
COPY . .
ARG REACT_APP_API_HOST
ARG REACT_APP_REMOTE_CURRENT
ENV REACT_APP_API_HOST $REACT_APP_API_HOST
ENV REACT_APP_REMOTE_CURRENT $REACT_APP_REMOTE_CURRENT
RUN yarn build

FROM nginx:alpine
COPY docker/www/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /build /usr/share/nginx/html
ENTRYPOINT ["nginx", "-g", "daemon off;"]
