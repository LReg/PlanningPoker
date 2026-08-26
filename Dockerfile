# @langchain/openai's own dependency (openai@7.x) requires Node >=22 — it needs the
# native WebSocket global, stable since Node 22, not the node:18 this used to be.
FROM node:22 as backend

WORKDIR /opt/app
COPY backend/tsconfig.json .
COPY backend/package.json .
COPY backend/package-lock.json .
RUN npm ci
COPY backend/src src
# Compiled here at build time, not on every container boot — this used to run `tsc`
# as part of the container's CMD, recompiling on every restart inside the pod's own
# memory limit. That's what turned into an OOMKill once the AI dependencies made tsc's
# peak memory usage cross it (verified: ~330MB peak vs. the 256Mi pod limit). Matches
# musik-star/huntcontrol's pattern — compile once in the image, ship compiled JS.
RUN npm run build
CMD ["npm", "run", "start:prod"]
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
RUN npm run build
# TODO Add Linter

FROM nginx:1.22.1 as frontend
COPY frontend/docker/remote.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=f-prod /build/dist /usr/share/nginx/html
# Renders config.json from real env vars at container start — see docker-entrypoint.sh.
# Values are no longer baked into the JS bundle at build time (see environments.ts):
# the same image now runs unmodified in any environment, docker-compose or k8s.
COPY frontend/docker-entrypoint.sh /docker-entrypoint.d/40-write-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-write-runtime-config.sh

EXPOSE 80