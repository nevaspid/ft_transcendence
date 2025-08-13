#!/bin/sh
set -e

# SERVER_IP=${SERVER_IP:-10.11.1.3}
# SERVER_DOMAIN=${SERVER_DOMAIN:-pongwars.com}

mkdir -p /etc/nginx/certs

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -subj "/CN=${SERVER_DOMAIN}" \
  -addext "subjectAltName=DNS:${SERVER_DOMAIN},IP:${SERVER_IP}" \
  -keyout /etc/nginx/certs/app.${SERVER_DOMAIN}-key.pem \
  -out /etc/nginx/certs/app.${SERVER_DOMAIN}.pem

envsubst '${SERVER_IP} ${SERVER_DOMAIN}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"





