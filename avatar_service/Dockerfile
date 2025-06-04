# Utiliser une image Node officielle légère
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code de l'application
COPY . .

# Créer le dossier uploads pour stocker les avatars
RUN mkdir -p uploads

# Exposer le port utilisé par l'application
EXPOSE 3001

# Commande pour démarrer le service
CMD ["node", "server.js"]
