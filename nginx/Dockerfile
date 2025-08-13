FROM nginx:stable-alpine

RUN apk add --no-cache openssl gettext

COPY nginx.conf /etc/nginx/conf.d/default.conf.template

COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]

