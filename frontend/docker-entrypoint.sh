#!/bin/sh
# Runs automatically before nginx starts (nginx:alpine executes every executable script under
# /docker-entrypoint.d/). Overwrites the checked-in localhost defaults in config.json with the
# container's actual environment — same pattern as musik-star's frontend.
set -eu

CONFIG_PATH="/usr/share/nginx/html/config.json"

: "${DOMAIN:?DOMAIN must be set}"
: "${PROTOCOL:?PROTOCOL must be set}"
: "${PRODUCTION:=false}"
: "${DEV_SERVER:=false}"
: "${TRAEFIK:=false}"
: "${BACKEND_PORT:=8080}"
: "${PRODUCTION_ADDRESS:=}"
: "${UMAMI_WEBSITE_ID:=}"

cat > "$CONFIG_PATH" <<EOF
{
  "domain": "${DOMAIN}",
  "protocol": "${PROTOCOL}",
  "production": ${PRODUCTION},
  "devServer": ${DEV_SERVER},
  "traefik": ${TRAEFIK},
  "backendPort": "${BACKEND_PORT}",
  "productionAddress": "${PRODUCTION_ADDRESS}",
  "umamiWebsiteId": "${UMAMI_WEBSITE_ID}"
}
EOF

echo "Wrote runtime config to ${CONFIG_PATH}:"
cat "$CONFIG_PATH"
