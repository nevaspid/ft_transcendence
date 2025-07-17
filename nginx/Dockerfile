FROM nginx:stable-alpine

RUN apk add --no-cache openssl

# Création du dossier pour le certificat
RUN mkdir /etc/nginx/certs

# Génération du certificat auto-signé avec les bons noms
RUN openssl req -x509 -nodes -days 365 \
  -subj "/CN=localhost" \
  -newkey rsa:2048 \
  -keyout /etc/nginx/certs/app.localhost-key.pem \
  -out /etc/nginx/certs/app.localhost.pem

# Copie du fichier de config nginx dans le conteneur
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443

