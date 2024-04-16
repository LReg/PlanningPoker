FROM node:18 as backend

LABEL MAINTAINER="Nils Abbing"
WORKDIR /opt/app
COPY backend/tsconfig.json .
COPY backend/package.json .
COPY backend/package-lock.json .
RUN npm ci
COPY backend/src src
CMD ["npm", "run", "start"]
EXPOSE 80

####################################
# frontend ('f-' Prefix)
####################################
FROM node:18 as f-file-loader
WORKDIR /data
COPY frontend/package.json .
COPY frontend/package-lock.json .
COPY frontend/tsconfig.json .
COPY frontend/tsconfig.node.json .
COPY frontend/tsconfig.app.json .
COPY frontend/env.d.ts .
COPY frontend/vite.config.ts .

FROM node:18 as f-dependencyfetcher
WORKDIR /build
COPY --from=f-file-loader /data .
RUN npm install

FROM f-dependencyfetcher as f-build-files
WORKDIR /build
RUN mkdir src
COPY frontend/src ./src
COPY frontend/index.html .
COPY frontend/public ./public

# Prod builds
FROM f-build-files as f-prod
ARG PRODUCTION
ENV VITE_PRODUCTION=$PRODUCTION
ARG DOMAIN
ENV VITE_DOMAIN=$DOMAIN
ARG PROTOCOL
ENV VITE_PROTOCOL=$PROTOCOL
ARG TRAEFIK
ENV VITE_TRAEFIK=$TRAEFIK
ARG BACKEND_PORT
ENV VITE_BACKEND_PORT=$BACKEND_PORT
RUN npm run build
# TODO Add Linter

FROM nginx:1.22.1 as frontend
COPY frontend/docker/remote.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=f-prod /build/dist /usr/share/nginx/html

EXPOSE 80