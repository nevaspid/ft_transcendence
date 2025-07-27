FROM node:20

# Crée le répertoire de travail
WORKDIR /app

# Copie package.json d'abord pour cache deps
COPY package*.json ./

# Installe deps
RUN npm install

# Copie tout le projet
COPY . .

# Expose le port utilisé dans server.js
EXPOSE 3000

# Commande de lancement
CMD ["node", "--env-file=backend/server/.env", "start.js"]
